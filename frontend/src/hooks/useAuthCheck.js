import { useEffect, useState } from "react";

export default function useAuthCheck() {
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Optionally, perform a different auth check or just skip
        setChecking(false);
    }, []);

    return checking;
}
