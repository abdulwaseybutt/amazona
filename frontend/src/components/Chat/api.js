import axios from "axios";
import { API_URL } from "../../utils";

export async function getUserChatList({ token, id }) {
    try {
        const response = await axios.get(`${API_URL}api/chat/messages/${id}`, {
            headers: {
                authorization: token
            }
        });
        return response.data;
    }
    catch (error) {
        console.log("Error in getting users chat list...");
        console.error(error);
        throw new Error(error?.message);
    }

}


export async function getChat({ token, productId,senderId }) {

    if(!productId || !senderId) return;
    try {
        const response = await axios.get(`${API_URL}api/chat/messages?productId=${productId}&senderId=${senderId}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }
    catch (error) {
        console.log("Error in getting users chat ...");
        console.error(error);
        throw new Error(error?.message);
    }

}


export async function getBuyerChat({ token, productId }) {

    if(!productId) return;
    try {
        const response = await axios.get(`${API_URL}api/chat/messages/buyer?productId=${productId}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }
    catch (error) {
        console.log("Error in getting users chat ...");
        console.error(error);
        throw new Error(error?.message);
    }
}

export async function sendChat({ receiverId="", productId, message, token,isOffer=false }) {

    if(!productId) return;
    try {

        if(isOffer) message= parseInt(message) || 0;

        const response = await axios.post(`${API_URL}api/chat/send`, {
            receiverId,
            productId,
            message,
            isOffer
        }, {
            headers: { authorization: `Bearer ${token}` }
        });
        return response.data;
    }
    catch (error) {
        console.log("Error in sending the chat");
        console.error(error);
        throw new Error(error?.message);
    }
}


export async function getSellerChatList({token}){
    try {
        const response = await axios.get(`${API_URL}api/chat/seller/list`, {
            headers: { authorization: `Bearer ${token}` }
        });
        return response.data;
    }
    catch (error) {
        console.log("Error in getting the seller's chat");
        console.error(error);
        throw new Error(error?.message);
    }
}

export async function getBuyerChatList({token}){
    try {
        const response = await axios.get(`${API_URL}api/chat/buyer/list`, {
            headers: { authorization: `Bearer ${token}` }
        });
        return response.data;
    }
    catch (error) {
        console.log("Error in getting the seller's chat");
        console.error(error);
        throw new Error(error?.message);
    }
}