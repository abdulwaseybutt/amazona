import mongoose from "mongoose";

const ChatModel = new mongoose.Schema(
    {
        senderId: {type:mongoose.Types.ObjectId,required:true,ref:"User"},
        productId:{type:mongoose.Types.ObjectId,required:true,ref:"Product"},
        message: {
            type: String,
            required:true
        },
        receiverId: {type:mongoose.Types.ObjectId,required:true,ref:"User"},
        isOffer:{type:Number,default:false}
    }, {
    timestamps: true
}
);

const Chat = mongoose.model("Chat", ChatModel);

export default Chat;
