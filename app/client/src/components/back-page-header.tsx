import Typography from "@/components/typography";
import { MoveLeft } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";

// This component is used to display a header with a back button and a title.
const BackPageHeader: React.FC<{ title: string, redirect?: string }> = ({ title, redirect }) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center w-full pb-1">
            <button onClick={() => {
                redirect ? navigate(redirect) : navigate(-1);
            }} className="absolute">
                <MoveLeft size={42} strokeWidth={1} />
            </button>
            <Typography variant="h3" className="m-auto">{title}</Typography>
        </div>
    );
};

export { BackPageHeader };
