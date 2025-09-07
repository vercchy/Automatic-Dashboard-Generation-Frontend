const SESSION_KEY = "neo4j_session_id";

export const saveSessionId = (sessionId: string) => {
    localStorage.setItem(SESSION_KEY, sessionId);
};

export const getSessionId = (): string | null => {
    return localStorage.getItem(SESSION_KEY);
};

export const clearSessionId = () => {
    localStorage.removeItem(SESSION_KEY);
};
