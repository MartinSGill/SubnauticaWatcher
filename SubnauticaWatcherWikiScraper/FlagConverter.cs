namespace SubnauticaWatcherWikiScraper
{
    #region imports

    using System;
    using System.Linq;
    using Newtonsoft.Json;

    #endregion

    public class FlagConverter : JsonConverter
    {
        public override object ReadJson(
            JsonReader reader,
            Type objectType,
            object existingValue,
            JsonSerializer serializer)
        {
            //No need to deserialize.
            return null;
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            var flags = value.ToString()
                             .Split(new[] {", "}, StringSplitOptions.RemoveEmptyEntries)
                             .Select(f => $"\"{f}\"");

            writer.WriteRawValue($"[{string.Join(", ", flags)}]");
        }

        public override bool CanConvert(Type objectType)
        {
            return true;
        }
    }
}
