"use client"

import useDebounce from "@/hooks/useDebounce";
import qs from "query-string";
import { useEffect, useState } from "react";
import Input from "./Input";
import { useRouter } from "next/navigation";

const SearchInput = () => {
    const router = useRouter();
    const [value, setValue] = useState<string>("");
    const debounceValue = useDebounce<string>(value, 500);

    useEffect(() => {
        const query = {
            title: debounceValue,
        };

        const url = qs.stringifyUrl({
            url: '/search',
            query: query
        });

        router.push(url);
    }, [debounceValue, router]);

    return (
        <Input
            placeholder="What do you want to listen to ?"
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    );
}

export default SearchInput;