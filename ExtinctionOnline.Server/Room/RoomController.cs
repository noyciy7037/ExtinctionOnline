namespace ExtinctionOnline.Server
{
    internal class RoomController
    {
        internal static void JoinToRoom(RoomMessageData roomData, ClientInfo client)
        {
            if (client.RoomId != null)
            {
                throw new Exception("You are already in a room.");
            }
            else if (roomData.RoomId == null)
            {
                string roomGuid = Guid.NewGuid().ToString();
                RoomData room = new RoomData(roomGuid, roomData.RoomName ?? roomGuid);
                room.AddClient(client);
                Server.s_lobby.Remove(client);
                Server.s_rooms.Add(roomGuid, room);
            }
            else if (Server.s_rooms.ContainsKey(roomData.RoomId))
            {
                Server.s_lobby.Remove(client);
                Server.s_rooms[roomData.RoomId].AddClient(client);
            }
            else
            {
                throw new Exception($"Rooms that do not exist: {roomData.RoomId}");
            }
        }
    }
}
