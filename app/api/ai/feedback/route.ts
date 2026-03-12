import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const text = await req.text();
        console.log("Received AI Feedback Request, Body Length:", text.length);

        if (!text) {
            console.error("AI Feedback Error: Empty request body");
            return NextResponse.json(
                { error: "Empty request body" },
                { status: 400 }
            );
        }

        let body;
        try {
            body = JSON.parse(text);
        } catch (e) {
            console.error("AI Feedback Error: Failed to parse JSON. Raw text:", text);
            throw e;
        }

        const { dailyChecks, goal, averages, streak, completionRate } = body;

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GOOGLE_API_KEY is not configured" },
                { status: 500 }
            );
        }

        const model = new ChatGoogleGenerativeAI({
            apiKey: apiKey,
            model: "gemini-2.5-flash", // More stable quota for free tier
            maxOutputTokens: 1500,
            streaming: true,
            maxRetries: 0, // Fail fast if quota exceeded, instead of 50s pending
        });

        // Minify data to save input tokens
        const simplifiedChecks = dailyChecks.slice(-7).map((c: any) => ({
            d: c.date?.slice(5) || "", // MM-DD only
            s: c.scores ? Object.values(c.scores) : [], // Values only
            m: c.diary ? 1 : 0 // Flag only
        }));

        const template = `너는 자립 보조자야. 아래 데이터를 보고 3줄(150자) 내외로 따뜻한 피드백을 줘.
목표:{goalText},연속:{streak}일,기록률:{completionRate}%
평균:수면{sleepAvg},식사{nutritionAvg},정신{distressAvg},충동{impulseAvg},운동{exerciseAvg}
최근기록:{recentChecks}

지침:
0. 최대 200자.
1.격려로 시작.
2.일기/다짐 내용 있으면 공감해주되 날짜/내용 구체적 언급 금지.
3.수치 기반 조언 1개.
4.친근한 말투와 이모지.
5.텍스트만 출력.`;

        const prompt = PromptTemplate.fromTemplate(template);
        const chain = prompt.pipe(model).pipe(new StringOutputParser());

        const stream = await chain.stream({
            goalText: goal.text,
            streak,
            completionRate,
            sleepAvg: averages.sleep,
            nutritionAvg: averages.nutrition,
            distressAvg: averages.distress,
            impulseAvg: averages.impulse,
            exerciseAvg: averages.exercise,
            recentChecks: JSON.stringify(simplifiedChecks),
        });

        const encoder = new TextEncoder();
        const responseStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        controller.enqueue(encoder.encode(chunk));
                    }
                    controller.close();
                } catch (error) {
                    console.error("Streaming error:", error);
                    controller.error(error);
                }
            },
        });

        return new Response(responseStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("AI Feedback Error:", error);
        return NextResponse.json(
            { error: "Failed to generate AI feedback" },
            { status: 500 }
        );
    }
}
