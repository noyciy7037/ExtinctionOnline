using ExtinctionOnline.Server.ClientData;
using ExtinctionOnline.Server.Communication;
using ExtinctionOnline.Server.Room;

namespace ExtinctionOnline.Server
{
    internal class Commands
    {
        public static void SystemCommand(MessageData messageData, ClientInfo client, string original)
        {
            if (messageData.RoomDataMessage == null) throw new NullReferenceException("roomData is needed.");
            var roomData = messageData.RoomDataMessage;
            RoomController.JoinToRoom(roomData, client);
        }

        public static void Game(MessageData messageData, ClientInfo client, string original)
        {
            if (messageData.RoomDataMessage == null) throw new NullReferenceException("roomData is needed.");
            var roomData = messageData.RoomDataMessage;
            if (roomData.RoomId == null) throw new NullReferenceException("roomData.RoomId is needed.");
            if (messageData.DeliveryTo == null) throw new NullReferenceException("deliveryTo is needed.");
            DeliveryTo deliveryTo = messageData.DeliveryTo;
            if (deliveryTo.Type == null) throw new NullReferenceException("deliveryTo.type is needed.");
            if (deliveryTo.Type == "ROOM")
            {
                Server.s_rooms[roomData.RoomId].MessageToAll(original);
                return;
            }
            if (deliveryTo.ClientId == null) throw new NullReferenceException("deliveryTo.clientId is needed.");
            ClientInfo? toClient = Server.s_rooms[roomData.RoomId]._clients.Find(it => it.ClientId == deliveryTo.ClientId);
            if (toClient == null) throw new Exception($"Client {deliveryTo.ClientId} was not found.");
            toClient.Socket.Send(original);
        }
    }
}