/// <reference types="vite-plugin-svgr/client" />
import { BackPageHeader } from "@/components/back-page-header";
import * as React from "react";
import { Link } from "react-router-dom";
import Errorsvg from "../../assets/error-404.svg?react";

// The 404 page displayed when the user tries to access a page that does not exist
const Error404: React.FC = () => {
    return (
        <>
            <div className="flex flex-col items-center py-16 px-8 w-full h-full">
                <BackPageHeader title="" />
                <Errorsvg className="w-4/5 h-full max-w-xl" />
                <h1 className="px-4 pt-8 pb-4 text-center dark:text-white text-5xl font-bold leading-10 text-gray-800">OOPS!</h1>
                <p className="px-4 pb-10 text-base leading-none dark:text-gray-200 text-center text-gray-600">We cannot find the page you are looking for...</p>
                <Link to="/" className="mx-4 h-10 w-44 rounded-md text-white text-base bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-indigo-800 align-middle flex items-center justify-center" >Go Home</Link>
            </div>
        </>
    );
};

export { Error404 };
