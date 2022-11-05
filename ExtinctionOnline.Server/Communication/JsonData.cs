using System.Text.Json.Serialization;

namespace ExtinctionOnline.Server
{
    public class MessageData
    {
        [JsonPropertyName("messageType")]
        // SYSTEM / GAME
        public string? MessageType { get; set; }

        [JsonPropertyName("from")]
        // SERVER / client-id
        public string? From { get; set; }

        [JsonPropertyName("roomData")]
        public RoomMessageData? RoomDataMessage { get; set; }

        [JsonPropertyName("deliveryTo")]
        public DeliveryTo? DeliveryTo { get; set; }
    }

    public class RoomMessageData
    {
        [JsonPropertyName("roomId")]
        public string? RoomId { get; set; }

        [JsonPropertyName("roomName")]
        public string? RoomName { get; set; }
    }

    public class DeliveryTo
    {
        [JsonPropertyName("type")]
        // ROOM / CLIENT / SERVER
        public string? Type { get; set; }

        [JsonPropertyName("clientId")]
        public string? ClientId { get; set; }
    }
}