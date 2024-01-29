"use client"
import { API_SERVER_URL } from "@/lib/data";
import { getReqConfig } from "@/lib/util";
import axios from "axios";
import { SearchIcon, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { CurrentUserContext } from "./App";

export default function Search({ onSearchResult, onClose, close }) {

    const { currentUser } = useContext(CurrentUserContext);

    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const [searchText, setSearchText] = useState("");

    useEffect(() => { handleClose() }, [close]);

    const searchUsers = async (e) => {
        const searchTextValue = e.target?.value?.trim();
        setSearchText(searchTextValue);
        if (searchTextValue.length < 3) return;
        try {
            setLoading(true);
            const value = await axios.get(`${API_SERVER_URL}/users?searchText=${searchTextValue}`, getReqConfig(currentUser.token));
            setLoading(false);
            onSearchResult(value.data);
        } catch (reason) {
            setLoading(false);
            console.log(reason);
        }
    };

    const handleClose = () => {
        setSearchText("");
        setFocused(false);
        setLoading(false);
        onClose && onClose();
    }

    return (
        <div className="search-bar">
            <div className="display-horizontal search-bar-items-wrapper">
                <SearchIcon className="mx-2" color="var(--tc-pri)" />
                <div className="flex-1">
                    <input type="text" name="searchText" value={searchText}
                        placeholder="email or name"
                        onChange={searchUsers}
                        onFocus={() => setFocused(true)}
                        className="w-full rounded-3xl"
                        autoComplete="off"
                        required
                    />
                </div>
                {focused && loading && <TailSpin
                    visible={loading}
                    height="1.5em"
                    width="1.5em"
                    color="var(--ac-sec)"
                    radius="2"
                    wrapperClass="mx-2"
                />
                }
                {focused && !loading && <X onClick={handleClose} className="mx-2" color="var(--tc-pri)" />}
            </div>
        </div>
    );
}
