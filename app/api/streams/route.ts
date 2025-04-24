import { NextRequest, NextResponse } from "next/server";
import { StreamSchema } from "../schema/schema";
import { prismaClient } from "@/lib/db";

const YT_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(&.*)?$/;

export async function POST (req: NextRequest){
    try {
            const data = StreamSchema.parse(await req.json());
            const isYt = YT_REGEX.test(data.url)

            if (!isYt){
                return NextResponse.json({message : 'Wrong URL format'},{status: 411})
            }

            const extractedId = data.url.split('?v=')[1]            
            const thumbnailUrl = `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`;           
            const title = await getYoutubeTitle(extractedId);

            const createdStream = await prismaClient.stream.create({
                data : {
                    userId : data.creatorId,
                    url    : data.url,
                    thumbnailUrl : thumbnailUrl,
                    title : title, 
                    extractedId : extractedId as string,
                    type : 'Youtube'
                }
            })
            return NextResponse.json({ Stream_Created: createdStream }, { status: 201 });
    }catch(e){
        console.log(e);
        return NextResponse.json({message : 'Stream Creation failed'},{status: 411})
    }
}

export async function GET(req: NextRequest){
    const creatorId = req.nextUrl.searchParams.get('creatorId');
    const streams = await prismaClient.stream.findMany({
        where : {
            userId : creatorId ?? ""
        }
    })
    return NextResponse.json({
        streams
    })
}



const getYoutubeTitle = async (videoId: string) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  
    const res = await fetch(url);
    const data = await res.json();
  
    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found");
    }    
    return data.items[0].snippet.title;
  };
  