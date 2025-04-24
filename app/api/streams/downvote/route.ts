import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { UpvoteSchema } from "../../schema/route";


export async function POST (req:NextRequest){
    const session = await getServerSession();
    
    const user = await prismaClient.user.findFirst({
        where: {
            email : session?.user?.email ?? ""
        }
    })    
    if (!user){
        return NextResponse.json({message : "Unauthenticated"}, {status : 403})
    }
    try {
        const data = UpvoteSchema.parse(await req.json())
        const deletedUpvote = await prismaClient.upvote.delete({
            where : {
                userId_streamId : {
                    userId   : user.id,
                    streamId : data.streamId
                }
            }
        })
        return NextResponse.json({Deleted_Upvote: deletedUpvote}, {status:200})
    }catch(e){
        return NextResponse.json({message : "Failed to create a downvote"})
    }
}