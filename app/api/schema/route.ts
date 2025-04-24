import zod from 'zod'

export const StreamSchema = zod.object({
    creatorId : zod.string(),
    url : zod.string()
})

export const UpvoteSchema = zod.object({
    streamId : zod.string(),
})