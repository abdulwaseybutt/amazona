import React, { useEffect,useState } from 'react'

const ChatPagination = ({ chatListBackup, setChatList, totalRowsPerPage, pageCount, chatList ,setPageCount}) => {

    const [disableNextPage, setDisableNextPage] = useState(false);
    const [disablePreviousPage, setDisablePreviousPage] = useState(false);

    useEffect(() => {
        checkNextButton();
        checkPreviousButton();
    }, [chatList]);

    const checkNextButton = () => {
        if (pageCount * totalRowsPerPage >= chatListBackup?.length) setDisableNextPage(true);
        else setDisableNextPage(false);
    }

    const checkPreviousButton = () => {
        if (pageCount==1) setDisablePreviousPage(true);
        else setDisablePreviousPage(false);
    }

    const handleNext = () => {
        const start=pageCount * totalRowsPerPage;
        const end= start + totalRowsPerPage;
        setPageCount(pageCount + 1);
        setChatList(chatListBackup?.slice(start,end));
    }

    const handlePrevious=()=>{
        const start=(pageCount * totalRowsPerPage) - 2 * totalRowsPerPage;
        const end= start + totalRowsPerPage;
        setPageCount(pageCount - 1);
        setChatList(chatListBackup?.slice(start,end));
        
    }

    return (
        <div className="flex flex-col items-center mt-4 md:mt-8">
            <span className="text-xs md:text-sm text-gray-900">
                Showing <span className="font-semibold text-gray-900 ">{(pageCount * totalRowsPerPage)-totalRowsPerPage + 1}</span> to <span className="font-semibold text-gray-900 ">{pageCount * totalRowsPerPage}</span> of <span className="font-semibold text-gray-900">{chatListBackup?.length}</span> Entries
            </span>
            <div className="inline-flex mt-2 xs:mt-0">
                <button className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" onClick={handlePrevious} disabled={disablePreviousPage}>
                    <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                    </svg>
                    Prev
                </button>
                <button className={`flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`} disabled={disableNextPage} onClick={handleNext}>
                    Next
                    <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default ChatPagination;