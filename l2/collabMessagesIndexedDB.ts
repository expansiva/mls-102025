/// <mls shortName="collabMessagesIndexedDB" project="102025" enhancement="_blank" />

const MAXMESSAGESBYTHREAD = 100;
const VERSION = 5;

export function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("msgDB", VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains("threads")) {
                const threadStore = db.createObjectStore("threads", { keyPath: "threadId" });
                threadStore.createIndex("byName", "name", { unique: false });
            } else {
                const threadStore = (event.target as IDBOpenDBRequest).transaction!.objectStore("threads");
                if (!threadStore.indexNames.contains("byName")) {
                    threadStore.createIndex("byName", "name", { unique: false });
                }
            }

            if (!db.objectStoreNames.contains("poolings")) {
                const poolingStore = db.createObjectStore("poolings", { keyPath: "taskId" });

                poolingStore.createIndex("byUserId", "userId", { unique: false });
                poolingStore.createIndex("byStartAt", "startAt", { unique: false });
            }

            if (!db.objectStoreNames.contains("users")) {
                db.createObjectStore("users", { keyPath: "userId" });
            }

            if (!db.objectStoreNames.contains("tasks")) {
                db.createObjectStore("tasks", { keyPath: "PK" });
            }


            let messageStore: IDBObjectStore;
            if (!db.objectStoreNames.contains("messages")) {
                messageStore = db.createObjectStore("messages", { keyPath: "messageId" });
            } else {
                messageStore = (event.target as IDBOpenDBRequest).transaction!.objectStore("messages");
            }

            if (!messageStore.indexNames.contains("byThreadId")) {
                messageStore.createIndex("byThreadId", "threadId", { unique: false });
            }

            if (!messageStore.indexNames.contains("byThreadId_orderAt")) {
                messageStore.createIndex("byThreadId_orderAt", ["threadId", "orderAt"], { unique: false });
            }

        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao abrir o IndexedDB");
    });
}

export async function addMessages(messages: mls.msg.MessagePerformanceCache[]): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("messages", "readwrite");
        const store = tx.objectStore("messages");
        for (const message of messages) {
            const newMessage = {
                ...{ ...message, lastSync: getCompactUTC() },
                messageId: `${message.threadId}/${message.createAt}`,
            };
            store.put(newMessage);
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject("Erro ao adicionar mensagens");
        tx.onabort = () => reject("Transação abortada ao adicionar mensagens");
    });
}

export async function addMessage(message: mls.msg.MessagePerformanceCache): Promise<void> {

    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("messages", "readonly");
        const store = tx.objectStore("messages");
        const index = store.index("byThreadId_orderAt");

        const messagesInThread: mls.msg.MessagePerformanceCache[] = [];
        const range = IDBKeyRange.bound([message.threadId, ''], [message.threadId, '\uffff']);
        const request = index.openCursor(range);

        request.onsuccess = async (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                messagesInThread.push(cursor.value);
                cursor.continue();
            } else {

                const excess = messagesInThread.length - MAXMESSAGESBYTHREAD + 1;
                const messagesToDelete = excess > 0
                    ? messagesInThread.sort((a, b) => a.orderAt.localeCompare(b.orderAt)).slice(0, excess)
                    : [];

                try {

                    if (messagesToDelete.length > 0) {
                        deleteMessagesAndTasks(messagesToDelete);
                    }

                    const txWrite = db.transaction("messages", "readwrite");
                    const storeWrite = txWrite.objectStore("messages");

                    const newMessage = {
                        ...{ ...message, lastSync: getCompactUTC() },
                        messageId: `${message.threadId}/${message.createAt}`,
                    };

                    storeWrite.put(newMessage);
                    txWrite.oncomplete = () => resolve();
                    txWrite.onerror = () => reject("Erro ao adicionar mensagem");
                    txWrite.onabort = () => reject("Transação abortada");

                } catch (err) {
                    reject(err);
                }
            }
        };

        request.onerror = () => reject("Erro ao ler mensagens da thread");
    });
}

export async function updateMessage(message: mls.msg.Message): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("messages", "readwrite");
        const store = tx.objectStore("messages");

        const messageId = `${message.threadId}/${message.createAt}`;

        const getRequest = store.get(messageId);

        getRequest.onsuccess = () => {
            if (!getRequest.result) {
                reject(`Mensagem com ID ${messageId} não encontrada.`);
                return;
            }

            const updatedMessage = {
                ...getRequest.result,
                ...message,
                messageId,
            };

            const updateRequest = store.put(updatedMessage);
            updateRequest.onsuccess = () => resolve();
            updateRequest.onerror = () => reject("Erro ao atualizar mensagem.");
        };

        getRequest.onerror = () => reject("Erro ao buscar mensagem para atualização.");
        tx.onabort = () => reject("Transação abortada.");
    });
}

export async function deleteAllMessagesFromThread(threadId: string): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("messages", "readwrite");
        const store = tx.objectStore("messages");
        const index = store.index("byThreadId_orderAt");

        const range = IDBKeyRange.bound([threadId, ''], [threadId, '\uffff']);
        const request = index.openCursor(range);
        const messagesInThread: mls.msg.MessagePerformanceCache[] = [];

        request.onsuccess = async (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                messagesInThread.push(cursor.value);
                cursor.continue();
            } else {

                try {
                    if (messagesInThread.length > 0) await deleteMessagesAndTasks(messagesInThread);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }
        };

        request.onerror = () => reject("Erro ao deletar mensagens da thread");
        tx.onerror = () => reject("Erro na transação de deleção");
        tx.onabort = () => reject("Transação de deleção abortada");
    });
}


export async function getMessage(messageId: string): Promise<mls.msg.MessagePerformanceCache | undefined> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("messages", "readonly");
        const store = tx.objectStore("messages");
        const request = store.get(messageId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao buscar mensagem");
    });
}

export async function getMessagesByThreadId(
    threadId: string,
    limit: number = 15,
    offset: number = 0
): Promise<mls.msg.MessagePerformanceCache[]> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("messages", "readonly");
        const store = tx.objectStore("messages");
        const index = store.index("byThreadId");

        const range = IDBKeyRange.only(threadId);
        const request = index.openCursor(range, "prev"); // "prev" = mais recentes primeiro

        const messages: mls.msg.MessagePerformanceCache[] = [];
        let skipped = 0;

        request.onsuccess = () => {
            const cursor = request.result;
            if (!cursor || messages.length >= limit) {
                resolve(messages);
                return;
            }

            if (skipped < offset) {
                skipped++;
                cursor.continue();
                return;
            }

            messages.push(cursor.value);
            cursor.continue();
        };

        request.onerror = () => reject("Erro ao buscar mensagens por threadId com paginação");
    });
}


export async function getAllMessagesByThreadId(threadId: string): Promise<mls.msg.MessagePerformanceCache[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("messages", "readonly");
        const store = tx.objectStore("messages");
        const index = store.index("byThreadId");
        const request = index.getAll(IDBKeyRange.only(threadId));

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao buscar mensagens por threadId");
    });
}


async function deleteMessagesAndTasks(messages: mls.msg.MessagePerformanceCache[]): Promise<void> {

    const db = await openDB();
    const tx = db.transaction(["messages", "tasks"], "readwrite"); // transação para ambas stores
    const messageStore = tx.objectStore("messages");

    for (const msg of messages) {
        messageStore.delete(`${msg.threadId}/${msg.createAt}`,);
    }

    await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });

    for await (const msg of messages) {
        if (msg.taskId) {
            try {
                await deleteTask(msg.taskId);
            } catch (err) {
                console.warn(`Falha ao deletar task ${msg.taskId}:`, err);
            }
        }
    }
}

export async function addOrUpdateTask(task: mls.msg.TaskData): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("tasks", "readwrite");
        const store = tx.objectStore("tasks");
        store.put(task);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject("Erro ao adicionar task");
        tx.onabort = () => reject("Transação abortada");
    });
}

export async function getTask(taskId: string): Promise<mls.msg.TaskData | undefined> {
    const db = await openDB();
    const tx = db.transaction("tasks", "readonly");
    const store = tx.objectStore("tasks");

    return new Promise((resolve, reject) => {
        const request = store.get(taskId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao buscar task");
    });
}

export async function deleteTask(taskId: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("tasks", "readwrite");
        const store = tx.objectStore("tasks");

        const request = store.delete(taskId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject("Erro ao deletar task");
        tx.onabort = () => reject("Transação abortada");
    });
}

export async function listThreads(): Promise<mls.msg.ThreadPerformanceCache[]> {
    const db = await openDB();
    const tx = db.transaction("threads", "readonly");
    const store = tx.objectStore("threads");
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao listar threads");
    });
}

export async function addThread(thread: mls.msg.Thread): Promise<mls.msg.ThreadPerformanceCache> {
    const db = await openDB();

    const threadCache: mls.msg.ThreadPerformanceCache = {
        ...thread,
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0,
        lastSync: ''
    }

    return new Promise((resolve, reject) => {
        const tx = db.transaction("threads", "readwrite");
        const store = tx.objectStore("threads");
        store.put(threadCache);
        tx.oncomplete = () => resolve(threadCache);
        tx.onerror = () => reject("Erro ao adicionar thread");
        tx.onabort = () => reject("Transação abortada");
    });
}



export async function updateLastMessageReadTime(threadId: string, lastMessageReadTime: string): Promise<mls.msg.ThreadPerformanceCache> {

    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("threads", "readwrite");
        const store = tx.objectStore("threads");
        const request = store.get(threadId);

        request.onsuccess = () => {
            let threadDb = request.result;

            if (!threadDb) {
                reject(`Thread com ID ${threadId} não encontrada.`);
                return;
            }

            threadDb = { ...threadDb, lastMessageReadTime }
            const updateRequest = store.put(threadDb);
            updateRequest.onsuccess = () => resolve(threadDb);
            updateRequest.onerror = () => reject("Erro ao atualizar a thread");
        };

        request.onerror = () => reject("Erro ao buscar a thread");
    });
}

export async function updateThread(
    threadId: string,
    thread: mls.msg.Thread,
    lastMessage?: string,
    lastMessageTime?: string,
    unreadCount?: number,
    lastSync?: string,
): Promise<mls.msg.ThreadPerformanceCache> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("threads", "readwrite");
        const store = tx.objectStore("threads");
        const request = store.get(threadId);

        request.onsuccess = () => {
            let threadDb = request.result;

            if (!threadDb) {
                reject(`Thread com ID ${threadId} não encontrada.`);
                return;
            }

            threadDb = { ...threadDb, ...thread }
            if (lastMessage !== undefined) threadDb.lastMessage = lastMessage;
            if (lastMessageTime !== undefined) threadDb.lastMessageTime = lastMessageTime;
            if (unreadCount !== undefined) threadDb.unreadCount = unreadCount;
            if (lastSync !== undefined) threadDb.lastSync = lastSync;
            const updateRequest = store.put(threadDb);
            updateRequest.onsuccess = () => resolve(threadDb);
            updateRequest.onerror = () => reject("Erro ao atualizar a thread");
        };

        request.onerror = () => reject("Erro ao buscar a thread");
    });
}

export async function updateThreads(threadsFromServer: mls.msg.Thread[]): Promise<void> {

    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("threads", "readwrite");
        const store = tx.objectStore("threads");

        try {
            for (const thread of threadsFromServer) {

                const threadCache: mls.msg.ThreadPerformanceCache = {
                    ...thread,
                    lastMessage: '',
                    lastMessageTime: '',
                    unreadCount: 0,
                    lastSync: ''
                }

                store.put(threadCache);
            }
        } catch (err) {
            reject(`Erro ao inserir threads: ${err}`);
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject("Erro na transação de sincronização");
        tx.onabort = () => reject("Transação de sincronização abortada");
    });
}

export async function getThread(threadId: string): Promise<mls.msg.ThreadPerformanceCache | undefined> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("threads", "readonly");
        const store = tx.objectStore("threads");
        const request = store.get(threadId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao buscar thread");
    });
}

export async function getThreadByName(threadName: string): Promise<mls.msg.ThreadPerformanceCache | undefined> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("threads", "readonly");
        const store = tx.objectStore("threads");
        const index = store.index("byName");
        const request = index.get(threadName);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao buscar thread por nome");
    });
}

export async function getAllThreads(): Promise<mls.msg.ThreadPerformanceCache[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("threads", "readonly");
        const store = tx.objectStore("threads");

        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao listar todas as threads");
    });
}

export async function cleanupThreads(validThreadIds: string[]): Promise<void> {
    const db = await openDB();

    const existingThreads = await getAllThreads();
    const threadsToDelete = existingThreads.filter(
        (t) => !validThreadIds.includes(t.threadId)
    );

    if (threadsToDelete.length === 0) return;

    for (const thread of threadsToDelete) {
        try {

            await deleteAllMessagesFromThread(thread.threadId);
            await new Promise<void>((resolve, reject) => {
                const tx = db.transaction("threads", "readwrite");
                const store = tx.objectStore("threads");
                const request = store.delete(thread.threadId);

                request.onsuccess = () => resolve();
                request.onerror = () => reject("Erro ao deletar thread");
                tx.onabort = () => reject("Transação abortada ao deletar thread");
            });
        } catch (err) {
            console.warn(`Falha ao remover thread ${thread.threadId}:`, err);
        }
    }
}

export async function listUsers(): Promise<mls.msg.User[]> {
    const db = await openDB();
    const tx = db.transaction("users", "readonly");
    const store = tx.objectStore("users");

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao listar usuários");
    });
}

export async function addUser(user: mls.msg.User): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("users", "readwrite");
        const store = tx.objectStore("users");
        store.put(user);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject("Erro ao adicionar usuário");
        tx.onabort = () => reject("Transação de usuário abortada");
    });
}

export async function updateUsers(usersFromServer: mls.msg.User[]): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("users", "readwrite");
        const store = tx.objectStore("users");

        try {
            for (const user of usersFromServer) {
                store.put(user);
            }
        } catch (err) {
            reject(`Erro ao inserir usuários: ${err}`);
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject("Erro na transação de sincronização de usuários");
        tx.onabort = () => reject("Transação de sincronização de usuários abortada");
    });
}

export async function getUser(userId: string): Promise<mls.msg.User | undefined> {
    const db = await openDB();
    const tx = db.transaction("users", "readonly");
    const store = tx.objectStore("users");

    return new Promise((resolve, reject) => {
        const request = store.get(userId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao buscar usuário");
    });
}

export async function addPooling(pooling: PoolingTask): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("poolings", "readwrite");
        const store = tx.objectStore("poolings");

        store.put(pooling);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject("Erro ao adicionar pooling");
        tx.onabort = () => reject("Transação abortada");
    });
}

export async function deletePooling(taskId: string): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("poolings", "readwrite");
        const store = tx.objectStore("poolings");

        store.delete(taskId);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject("Erro ao deletar pooling");
    });
}

export async function getPooling(taskId: string): Promise<PoolingTask | undefined> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("poolings", "readonly");
        const store = tx.objectStore("poolings");

        const request = store.get(taskId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao buscar pooling");
    });
}

export async function listPoolings(): Promise<PoolingTask[]> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("poolings", "readonly");
        const store = tx.objectStore("poolings");

        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Erro ao listar poolings");
    });
}

export function getCompactUTC() {
    const now = new Date();

    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}


export interface PoolingTask {
    taskId: string;
    userId: string;
    startAt: string; // mesmo padrão UTC compactado que você já usa
}
