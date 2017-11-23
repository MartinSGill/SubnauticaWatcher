namespace SubnauticaWatcherMod
{
    #region imports

    using Oculus.Newtonsoft.Json;

    #endregion

    internal class DayNightInfo
    {
        public float DayScalar { get; set; }
        public float DayNightCycleTime { get; set; }
        public double Day { get; set; }
    }
}
