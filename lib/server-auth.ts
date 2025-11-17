import "server-only";
import {auth} from "./auth";
import {headers} from "next/headers";

export const serverAuth = async () => {
    return await auth.api.getSession({
        headers: await headers(),
    });
};

export const requireAdmin = async () => {
    const session = await serverAuth();
    return session?.user?.role === "ADMIN";

}