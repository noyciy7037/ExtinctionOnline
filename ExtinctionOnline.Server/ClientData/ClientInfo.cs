using Fleck;

namespace ExtinctionOnline.Server
{
    public class ClientInfo
    {
        public readonly string ClientId;
        public readonly IWebSocketConnection Socket;
        public string? RoomId = null;

        public ClientInfo(string id, IWebSocketConnection socket)
        {
            ClientId = id;
            Socket = socket;
        }
    }
}
