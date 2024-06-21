import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Store } from '../../Store';
import { getBuyerChat, getBuyerChatList, getChat, getSellerChatList, getUserChatList, sellerChatList, sendChat } from './api';
import { timeAgo } from '../../utils';
import { useParams } from 'react-router-dom';
import ChatPagination from './ChatPagination';
import { IoMdArrowRoundBack } from "react-icons/io";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import Spinner from 'react-bootstrap/Spinner';
import 'react-loading-skeleton/dist/skeleton.css'
import { toast } from 'react-toastify';





const Chat = () => {

  const { productId: queryProductIdData } = useParams();
  const [queryProductId, setQueryProductId] = useState(queryProductIdData);

  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatListBackup, setChatListBackup] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [hideMainChat, setHideMainChat] = useState(false);
  const [hideChatList, setHideChatList] = useState(false);
  const [loadingChat, setLodaingChat] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [selectedChatSender, setSelectedChatSender] = useState("");
  const [isOffer, setIsOffer] = useState(false);

  const totalRowsPerPage = 5;


  const modeEnums = Object.freeze({
    chat: "chat",
    offer: "offer"
  });


  useEffect(() => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      setIsMobile(true);
      setHideMainChat(true);
      setHideChatList(false);
    } else {
      setIsMobile(false);
    }
  }, []);




  useEffect(() => {
    if (!userInfo) return;

    setLoadingList(true);

    if (queryProductId == "seller" && userInfo.isSeller == true) {
      getSellerChatList({ token: userInfo?.token }).then(res => {
        setLoadingList(false);
        setChatList(res?.slice(0, totalRowsPerPage) || []);
        setChatListBackup(res || []);
        setSelectedChatId(res?.[0]?._id);
        fetchLatestChat({ productId: res?.[0]?._id?.productId });

      });
    }
    else {


      if (queryProductId) {
        getBuyerChatList({ token: userInfo?.token }).then(res => {
          setLoadingList(false);
          setChatList(res?.slice(0, totalRowsPerPage) || []);
          setChatListBackup(res || []);
          fetchLatestChat({ productId: queryProductId });
        });

      }

      else {
        getBuyerChatList({ token: userInfo?.token }).then(res => {
          setLoadingList(false);
          setChatList(res?.slice(0, totalRowsPerPage) || []);
          setChatListBackup(res || []);
        });
      }
    }
  }, [queryProductId])


  const { state } = useContext(Store);
  const { userInfo } = state;

  const handleSendMessage = async () => {
    setSelectedChat([...selectedChat, { ...selectedChat?.[0], message: newMessage, createdAt: new Date(), senderId: userInfo?._id ,isOffer}]);
    setNewMessage("");

    if (queryProductId == "seller") {
      await sendChat({ message: newMessage, productId: selectedChatId?.productId, token: userInfo?.token, receiverId: selectedChatId?.senderId,isOffer});
    }
    else {
      await sendChat({ message: newMessage, productId: selectedChat?.[0]?.productId, token: userInfo?.token, isOffer });
    }
  };

  const searchListFilter = (event) => {
    const value = event?.target?.value || "";

    if (!value) {
      setChatList(chatListBackup?.slice(0, totalRowsPerPage));
      return;
    }

    let filteredChat = [];

    if (queryProductId == "seller") {
      filteredChat = chatList?.filter((chat) => chat?.senderDetails?.name?.includes(value));
    }
    else {
      filteredChat = chatList?.filter((chat) => chat?.productDetails?.name?.includes(value));
    }
    setChatList(filteredChat);

  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchLatestChat({ productId: selectedChat?.[0]?.productId });
    }, 3000);
    setIntervalId(intervalId);
    return () => clearInterval(intervalId);
  }, [selectedChat]);

  const fetchLatestChat = async ({ productId, senderId }) => {
    try {
      let chatRes;
      if (queryProductId == "seller") {
        chatRes = await getChat({ token: userInfo?.token || "", senderId: senderId || selectedChatId?.senderId, productId: productId || selectedChatId?.productId });
      }
      else {
        chatRes = await getBuyerChat({ token: userInfo?.token, productId });
      }
      setSelectedChat(chatRes || []);
    }
    catch (error) {
      console.log("Error in fetching latest chats");
      console.error(error);
      toast.error("Error in loading chat");
    }
  }

  const handleChatSelection = async (chat) => {
    clearInterval(intervalId);
    setLodaingChat(true);
    await fetchLatestChat({ productId: chat?._id?.productId, senderId: chat?._id?.senderId });
    setSelectedChatId(chat?._id);
    if (isMobile) {
      setHideChatList(true);
      setHideMainChat(false);
      if (queryProductId == "seller") setSelectedChatSender(chat?.senderDetails?.name);
      else setSelectedChatSender(chat?.productDetails?.name);
    };
    setLodaingChat(false);
  }


  const MessageTimeComponent = ({ messageDate }) => {
    const timeAgoString = useMemo(() => timeAgo(new Date(messageDate)), [messageDate]);
    return (
      <div className="text-xs text-gray-400">{timeAgoString}</div>
    );
  };


  const highlightChat = (chat) => {
    if (queryProductId == "seller") {
      const filteredChat = selectedChat?.filter(chat => chat.senderId !== userInfo?._id);
      return (filteredChat?.[0]?.productId == chat?._id?.productId && filteredChat?.[0]?.senderId == chat?._id?.senderId) ? "border-2 border-gray-900" : ""
    }
    else {
      console.info(selectedChat?.productId, chat?._id?.productId);

      return selectedChat?.[0]?.productId == chat?._id?.productId ? "border-2 border-gray-900" : "";
    }
  }

  const handleMobileBackBtn = () => {
    setHideMainChat(true);
    setHideChatList(false);
  }

  const handleChatMode = (mode) => {
    if (mode == modeEnums.chat) {
      setIsOffer(false);
    }
    else if (mode == modeEnums.offer) {
      setIsOffer(true);
    }
  }

  return (
    <div className="flex md:flex-row flex-col h-screen  text-white">

      {(isMobile && hideMainChat == false) && <div className='flex gap-1 justify-center cursor-pointer mt-1 text-dark' onClick={handleMobileBackBtn}>
        <IoMdArrowRoundBack size={"25px"} />
        <span>{selectedChatSender}</span>
      </div>}

      {/* CHAT LIST */}

      {(!hideChatList) && <div className="w-full md:w-1/4 md:p-4 bg-gray-100">
        <input
          type="text"
          className="w-full p-2 mb-4 rounded-lg bg-gray-300 border border-gray-200 text-dark"
          placeholder="Search"
          onChange={searchListFilter}
        />

        {(loadingList) ? <Spinner variant='secondary'/> : <div className="flex flex-col gap-2 border-gray-200 p-2">
          {chatList?.map(chat => <div className={`flex flex-col md:flex-row items-center p-1 md:p-2 bg-gray-200 rounded-lg cursor-pointer ${highlightChat(chat)} overflow-hidden text-dark`} onClick={() => handleChatSelection(chat)}>
            <img src={chat?.senderDetails?.image || "https://res.cloudinary.com/zain07/image/upload/v1718713766/profile_dawykd.avif"} alt="avatar" className={`rounded-full md:mr-2 h-8 w-8 md:w-12 md:h-12`} />
            <div className='flex flex-col overflow-hidden mt-1'>
              <span className='text-xs md:text-md text-center md:text-start'>{queryProductId == "seller" ? chat?.senderDetails?.name : chat?.productDetails?.name}</span>
              {queryProductId == "seller" && <span className={`text-xs ${isMobile ? "text-center" : ""}`}>{chat?.productDetails?.name}</span>}
            </div>

          </div>)}

          {chatList?.length == 0 && <span className='text-center mt-8 text-dark'>No conversations found :( </span>}

        </div>}

        {chatList?.length !== 0 && <ChatPagination chatListBackup={chatListBackup} setChatList={setChatList} totalRowsPerPage={totalRowsPerPage} pageCount={pageCount} chatList={chatList} setPageCount={setPageCount} />}
      </div>}


      {/* MAIN CHAT */}

      {(!hideMainChat) && <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto p-4 bg-gray-200 rounded-lg">


          {loadingChat ? <SkeletonTheme baseColor="#334155" highlightColor="#6b7280">
            <div style={{ padding: '10px', maxWidth: '400px' }}>
              <div style={{ display: 'flex', marginBottom: '10px' }}>
                <Skeleton circle={true} height={40} width={40} />
                <div style={{ marginLeft: '10px', flexGrow: 1 }}>
                  <Skeleton height={20} width="80%" />
                  <Skeleton height={15} width="60%" />
                </div>
              </div>
              <Skeleton height={100} />
              <div style={{ display: 'flex', marginTop: '10px' }}>
                <Skeleton circle={true} height={40} width={40} />
                <div style={{ marginLeft: '10px', flexGrow: 1 }}>
                  <Skeleton height={20} width="80%" />
                  <Skeleton height={15} width="60%" />
                </div>
              </div>
              <div style={{ marginLeft: '10px', flexGrow: 1 }}>
                <Skeleton height={20} width="80%" />
                <Skeleton height={15} width="60%" />
              </div>
            </div>
          </SkeletonTheme> : selectedChat?.map((chat, index) => (
            <div key={index} className={`flex ${chat.senderId === userInfo?._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-2 my-2 rounded-lg ${chat.isOffer ? "bg-[#14A44D]" : (chat.senderId === userInfo?._id ? 'bg-blue-500' : 'bg-gray-700')}`}>
                <div>{chat.isOffer ? <div className='flex flex-col'><div className='text-xs'>Offer</div> <div className='text-lg text-bold px-8 py-4'>$ {chat?.message}</div></div> : chat.message}</div>
                <MessageTimeComponent messageDate={chat?.createdAt} />
              </div>
            </div>
          ))}

        </div>

        <div className='flex gap-0.5 w-max-sm mt-2'>
          <button className={`${isOffer ? "bg-blue-200" : "bg-blue-500"} p-2 rounded`} onClick={() => handleChatMode(modeEnums.chat)}>Chat</button>
          <button className={`${!isOffer ?  "bg-green-200" : "bg-[#14A44D]" } p-2 rounded`} onClick={() => handleChatMode(modeEnums.offer)}>Offer</button>
        </div>



        <div className="mt-2 flex items-center rounded">
          <input
            type={`${isOffer ? "number" : "text"}`}
            className="flex-1 p-2 rounded-lg bg-gray-200 border border-gray-600 text-dark"
            placeholder={`${isOffer ? "Write your offer in numbers" : "Write a message"}`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <div>

          </div>
          <a
            className={`flex flex-row items-center justify-center w-full px-4 py-2.5 text-sm font-bold ${!isOffer ? "bg-blue-500" : "bg-[#14A44D]"} capitalize duration-100 transform rounded-sm shadow cursor-pointer focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 focus:outline-none w-auto  hover:shadow-lg hover:-translate-y-1`}
            onClick={handleSendMessage}
            >
            {isOffer ? "offer" : "send"}
          </a>
        </div>
      </div>



      }



    </div>
  );
};

export default Chat;
