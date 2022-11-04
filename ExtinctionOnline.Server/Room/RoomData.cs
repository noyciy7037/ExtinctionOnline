using ExtinctionOnline.Server.ClientData;
using ExtinctionOnline.Server.Communication;
using System.Text.Json;

namespace ExtinctionOnline.Server.Room
{
    internal class RoomData
    {
        internal string _id;
        internal string _name;
        internal bool _visibility = true;
        internal List<ClientInfo> _clients = new();

        internal RoomData(string id, string name)
        {
            _id = id;
            _name = name;
        }

        internal void AddClient(ClientInfo client)
        {
            client.RoomId = _id;
            _clients.Add(client);
            MessageToAll(JsonSerializer.Serialize(new MessageData
            {
                MessageType = "SYSTEM",
                From = client.ClientId,
                DeliveryTo = new DeliveryTo { Type = "ROOM" },
                RoomDataMessage = new RoomMessageData { RoomId = _id, RoomName = _name }
            },
                JsonUtil.GetJsonOptions()));
        }

        internal void RemoveClient(ClientInfo client)
        {
            client.RoomId = null;
            _clients.Remove(client);
            MessageToAll(JsonSerializer.Serialize(new MessageData
            {
                MessageType = "SYSTEM",
                From = client.ClientId,
                DeliveryTo = new DeliveryTo { Type = "ROOM" },
                RoomDataMessage = new RoomMessageData { RoomId = null }
            },
                JsonUtil.GetJsonOptions()));
        }

        internal void MessageToAll(string message)
        {
            for (int i = 0; i < _clients.Count; ++i)
                _clients[i].Socket.Send(message);
        }
    }
}
