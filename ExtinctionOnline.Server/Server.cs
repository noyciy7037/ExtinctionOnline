using ExtinctionOnline.Server.ClientData;
using ExtinctionOnline.Server.Communication;
using ExtinctionOnline.Server.Room;
using Fleck;
using System.Collections.Generic;
using System.Text.Json;

namespace ExtinctionOnline.Server
{
    /// <summary>
    /// Extinction Online のサーバー。
    /// </summary>
    public class Server
    {
        /// <summary>
        /// すべてのクライアントのリスト
        /// </summary>
        internal static readonly List<ClientInfo> s_clients = new();

        /// <summary>
        /// Lobbyに居るクライアントのリスト
        /// </summary>
        internal static readonly List<ClientInfo> s_lobby = new();

        /// <summary>
        /// それぞれのRoomのIDとRoomのリスト
        /// </summary>
        internal static readonly Dictionary<string, RoomData> s_rooms = new();

        /// <summary>
        /// メッセージ処理の辞書。呼び出し用
        /// </summary>
        static readonly Dictionary<string, Action<MessageData, ClientInfo, string>> s_messageTypes = new()
        {
            { "SYSTEM", Commands.SystemCommand },
            { "GAME", Commands.Game },
        };

        /// <summary>
        /// サーバーのメインメソッド。
        /// </summary>
        /// 
        /// <remarks>外部からの呼び出し非推奨</remarks>
        /// <param name="args">コマンド実行時の引数</param>
        public static void Main(string[] args)
        {
            Console.WriteLine(Logo.LogoStr);
            // TODO:ポート変更を可能に
            var server = new WebSocketServer("ws://0.0.0.0:1234");
            server.Start(socket =>
            {
                socket.OnOpen = () => OnOpen(socket);
                socket.OnClose = () => OnClose(socket);
                socket.OnMessage = message => OnMessage(socket, message);
            });

            // 標準入力を受付
            string? data = "";
            while (data == null || !data.StartsWith("exit"))
            {
                data = Console.ReadLine();
            }
            foreach (var c in new List<ClientInfo>(s_clients))
            {
                c.Socket.Close();
            }
            server.Dispose();
        }

        /// <summary>
        /// クライアントとの接続が開いたとき用のHook。
        /// </summary>
        /// <remarks>外部からの呼び出し非推奨</remarks>
        /// <param name="socket">クライアントとのソケット</param>
        static void OnOpen(IWebSocketConnection socket)
        {
            // Guidを生成してクライアントに送信、記録
            Guid clientGuid = Guid.NewGuid();
            s_clients.Add(new ClientInfo(clientGuid.ToString(), socket));
            socket.Send(JsonSerializer.Serialize(new MessageData { MessageType = "SYSTEM", DeliveryTo = new DeliveryTo { Type = "CLIENT", ClientId = clientGuid.ToString() } },
                JsonUtil.GetJsonOptions()));
            Console.WriteLine($"Open connection: {socket.ConnectionInfo.ClientIpAddress}:{socket.ConnectionInfo.ClientPort}");
        }

        /// <summary>
        /// クライアントとの接続が閉じたとき用のHook。
        /// </summary>
        /// <remarks>外部からの呼び出し非推奨</remarks>
        /// <param name="socket">クライアントとのソケット</param>
        static void OnClose(IWebSocketConnection socket)
        {
            var client = s_clients.Find(it => it.Socket.GetHashCode() == socket.GetHashCode());
            if (client != null)
            {
                if (client.RoomId != null)
                {
                    string roomId = client.RoomId;
                    lock (((System.Collections.IDictionary)s_rooms).SyncRoot)
                    {
                        s_rooms[roomId].RemoveClient(client);
                        if (s_rooms[roomId]._clients.Count <= 0) s_rooms.Remove(roomId);
                    }
                }
                else
                {
                    s_lobby.Remove(client);
                }
                lock (((System.Collections.ICollection)s_clients).SyncRoot)
                {
                    s_clients.Remove(client);
                }
            }
            Console.WriteLine($"Close connection: {socket.ConnectionInfo.ClientIpAddress}:{socket.ConnectionInfo.ClientPort}");
        }

        /// <summary>
        /// クライアントからメッセージを受け取ったとき用のHook。
        /// </summary>
        /// <remarks>外部からの呼び出し非推奨</remarks>
        /// <param name="socket">クライアントとのソケット</param>
        /// <param name="message">受け取ったメッセージ</param>
        static void OnMessage(IWebSocketConnection socket, string message)
        {
            Console.WriteLine(socket.GetHashCode());
            Console.WriteLine(message);
            try
            {
                MessageData? messageData = JsonSerializer.Deserialize<MessageData>(message, JsonUtil.GetJsonOptions());
                if (messageData == null) throw new NullReferenceException("messageData(Json body) is needed.");
                if (messageData.From == null) throw new NullReferenceException("from is needed.");
                if (messageData.MessageType == null) throw new NullReferenceException("messageType is needed.");
                var client = s_clients.Find(it => it.Socket.GetHashCode() == socket.GetHashCode());
                if (client == null) throw new NullReferenceException("client is null. Not found in client list.");
                if (client.ClientId != messageData.From) throw new Exception("ClientId does not match.");
                s_messageTypes[messageData.MessageType].Invoke(messageData, client, message);
            }
            catch (JsonException)
            {
                socket.Send("Invalid message. It must be JSON. Close connection.");
                socket.Close();
            }
            catch (Exception e)
            {
                socket.Send($"Invalid message. {e.Message}; Close connection.");
                socket.Close();
            }
        }
        /*
        /// <summary>
        /// すべてのクライアントにメッセージを送信する。
        /// </summary>
        /// <param name="data">送信するメッセージ本文</param>
        internal static void SendMessageToAll(string data)
        {
            foreach (var c in s_clients)
            {
                c.Socket.Send(data);
            }
        }

        /// <summary>
        /// 指定したRoom内の指定したクライアント以外にメッセージを送信する。
        /// </summary>
        /// <param name="roomId">RoomのID</param>
        /// <param name="data">送信するメッセージ本文</param>
        /// <param name="without">除外するクライアントのリスト</param>
        internal static void SendMessageToWithout(string roomId, string data, List<ClientInfo> without)
        {
            foreach (var c in s_rooms[roomId])
            {
                if (!without.Contains(c))
                    c.Socket.Send(data);
            }
        }

        /// <summary>
        /// 指定したクライアントにメッセージを送信する。
        /// </summary>
        /// <param name="data">送信するメッセージ本文</param>
        /// <param name="clients">クライアントのリスト</param>
        internal static void SendMessageToListClient(string data, List<ClientInfo> clients)
        {
            foreach (var c in clients)
            {
                c.Socket.Send(data);
            }
        }

        /// <summary>
        /// クライアントを指定したRoomに参加させる。
        /// </summary>
        /// <param name="roomId">RoomのID</param>
        /// <param name="client">参加するClient</param>
        /// <param name="doCreate">存在しないRoomを作成するか</param>
        public static void JoinClientToRoom(string roomId, ClientInfo client, bool doCreate)
        {
            if (s_rooms.ContainsKey(roomId))
            {
                s_rooms[roomId].Add(client);
            }
            else
            {
                if (doCreate)
                {
                    s_rooms.Add(roomId, new List<ClientInfo>() { client });
                }
                else
                {
                    throw new Exception("The specified Room does not exist.");
                }
            }
            client.RoomId = roomId;
            client.Socket.Send(JsonSerializer.Serialize(new MessageData
            {
                MessageType = "Room",
                RoomData = new RoomMessageData() { RequestType = "Joined", RoomId = roomId }
            }, JsonUtil.GetJsonOptions()));
            if (s_rooms[roomId].Count > 1)
            {
                List<ClientMessageData> clients = new List<ClientMessageData>();
                foreach (var existingClient in s_rooms[roomId])
                {
                    if (client.ClientId != existingClient.ClientId)
                        clients.Add(new ClientMessageData() { ClientId = existingClient.ClientId });
                }
                client.Socket.Send(JsonSerializer.Serialize(new MessageData
                {
                    MessageType = "Room",
                    RoomData = new RoomMessageData() { RequestType = "ClientsInfoNotification", RoomId = roomId },
                    ClientsInfo = clients,
                }));
            }
            SendMessageToWithout(roomId, JsonSerializer.Serialize(new MessageData
            {
                MessageType = "Room",
                ClientId = client.ClientId,
                RoomData = new RoomMessageData()
                {
                    RequestType = "ClientJoined",
                    RoomId = roomId
                }
            }, JsonUtil.GetJsonOptions()), new() { client });
        }*/
    }
}