namespace SubnauticaWatcherInstaller
{
    #region imports

    using System;
    using System.IO;
    using System.Linq;
    using Microsoft.Win32;
    using Mono.Cecil;
    using Mono.Cecil.Cil;
    using NLog;

    #endregion

    internal delegate void MessageCallback(string message);

    internal class Installer
    {
        private MessageCallback log;

        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        internal Installer(MessageCallback log)
        {
            this.log = log;
            SubnauticaPath = Path.Combine(SteamPath, @"steamapps\common\Subnautica");
        }

        private string SteamPath =>
            Registry.GetValue(@"HKEY_CURRENT_USER\Software\Valve\Steam", "SteamPath", null) as string;

        public string SubnauticaPath { get; set; }

        private string SubnauticaManagedPath => Path.Combine(SubnauticaPath, @"Subnautica_Data\Managed");

        private string SubnauticaDllPath => Path.Combine(SubnauticaManagedPath, @"Assembly-CSharp.dll");

        private string SubnauticaDllBackupPath => SubnauticaDllPath + ".subnautica-watcher-backup";

        internal int Install()
        {
            Logger.Debug("Install Requested");
            Logger.Debug($"Changing working dir: {SubnauticaManagedPath}");
            var initialDirectory = Directory.GetCurrentDirectory();
            Directory.SetCurrentDirectory(SubnauticaManagedPath);

            try
            {
                var exitCode = ValidatePaths();
                if (exitCode != 0) return exitCode;

                exitCode = BackupSubnauticaDll();
                if (exitCode != 0) return exitCode;

                exitCode = UpdateSubnauticaDll();
                return exitCode != 0 ? exitCode : 0;
            }
            finally
            {
                Logger.Debug($"Restoring working dir: {initialDirectory}");
                Directory.SetCurrentDirectory(initialDirectory);
            }
        }

        private int BackupSubnauticaDll()
        {
            // Always create a backup, safer this way.
            var backupFilename = Path.GetFileName(SubnauticaDllBackupPath);
            backupFilename += $".{DateTime.Now:yyyyMMddTHHmmss}";

            Logger.Debug("Backup of DLL requested.");

            try
            {
                File.Copy(
                    SubnauticaDllPath,
                    backupFilename);
                log($"Backup of Assembly-CSharp.dll created as '{backupFilename}'.");
            }
            catch (IOException ex)
            {
                log("Error: error attempting to create backup of Assembly-CSharp.dll.");
                log($"Error: {ex.Message}");
                Logger.Error(ex);
                return -4;
            }

            return 0;
        }

        internal int ValidatePaths()
        {
            Logger.Debug("Validate Paths requested.");
            if (Directory.Exists(SteamPath))
            {
                log($"Found Steam install directory. [{SteamPath}]");

                if (Directory.Exists(SubnauticaPath))
                {
                    log($"Found Subnautica install directory. [{SubnauticaPath}]");

                    if (Directory.Exists(SubnauticaManagedPath))
                    {
                        log($"Found Subnautica Data directory. [{SubnauticaManagedPath}]");
                        return 0;
                    }

                    log("Error: Unable to determine Subnautica Data directory.");
                    return -3;
                }
                log("Error: Unable to determine Subnautica install directory.");
                return -2;
            }
            log("Error: Unable to determine Steam install directory.");
            return -1;
        }

        private int UpdateSubnauticaDll()
        {
            log("Updating Assembly-CSharp.dll to load SubnauticaWatcherMod.");
            var targetAssembly = AssemblyDefinition.ReadAssembly(SubnauticaDllPath);
            if (!CheckPatched(targetAssembly))
                try
                {
                    var modAssemblyPath = Path.Combine(SubnauticaManagedPath, @"SubnauticaWatcherMod.dll");
                    var modAssembly = AssemblyDefinition.ReadAssembly(modAssemblyPath);
                    var modClass = modAssembly.MainModule.GetType("SubnauticaWatcherMod.Patching.Patcher");
                    var modMethod = modClass.Methods.Single(x => x.Name == "Patch");
                    var targetClass = targetAssembly.MainModule.GetType("GameInput");
                    var targetMethod = targetClass.Methods.First(x => x.Name == "Awake");
                    targetMethod.Body.GetILProcessor()
                                .InsertBefore(
                                    targetMethod.Body.Instructions[0],
                                    Instruction.Create(OpCodes.Call, targetMethod.Module.Import(modMethod)));
                    log("Saving Assembly.");
                    targetAssembly.Write(SubnauticaDllPath);
                    log("Assembly-CSharp.dll successfully updated.");
                }
                catch (Exception ex)
                {
                    log("Error: Failed to update Assembly-CSharp.dll.");
                    log($"Error: {ex.Message}");
                    Logger.Error(ex);
                    return -5;
                }
            else
                log("Assembly-CSharp.dll appears to have already been modified; no action taken.");

            return 0;
        }

        internal bool IsPatched
        {
            get
            {
                try
                {
                    return CheckPatched(AssemblyDefinition.ReadAssembly(SubnauticaDllPath));
                }
                catch
                {
                    return false;
                }
            }
        }

        private static bool CheckPatched(AssemblyDefinition targetAssembly)
        {
            Logger.Debug("Checking DLL for existin patch.");
            var type = targetAssembly.MainModule.GetType("GameInput");
            var methodDefinition = type.Methods.First(x => x.Name == "Awake");

            // Something else might have updated the DLL, so the patch might no longer
            // be the first instruction.
            var hasPatchInstruction = methodDefinition.Body.Instructions
                                                      .Where(x => x.OpCode == OpCodes.Call)
                                                      .Any(
                                                          x => (x.Operand as MethodReference)?.DeclaringType.FullName
                                                               == "SubnauticaWatcherMod.Patching.Patcher");
            return hasPatchInstruction;
        }

        internal int Uninstall()
        {
            // Need to be in the correct folder to resolve dependencies correctly
            Logger.Debug("Uninstall Requested.");
            var initialDirectory = Directory.GetCurrentDirectory();
            Logger.Debug($"Changing working dir: {SubnauticaManagedPath}");
            Directory.SetCurrentDirectory(SubnauticaManagedPath);

            if (!IsPatched)
            {
                log("Error: Not Patched, uninstall not required.");
                return -8;
            }

            if (BackupSubnauticaDll() != 0) return -9;
            
            var targetAssembly = AssemblyDefinition.ReadAssembly(SubnauticaDllPath);
            var type = targetAssembly.MainModule.GetType("GameInput");
            var methodDefinition = type.Methods.First(x => x.Name == "Awake");

            // Something else might have updated the DLL, so the patch might no longer
            // be the first instruction.
            try
            {
                var instruction = methodDefinition.Body.Instructions
                                                  .Where(
                                                      x => x.OpCode
                                                           == OpCodes.Call)
                                                  .First(x => (x.Operand as MethodReference)
                                                           ?.DeclaringType.FullName
                                                           == "SubnauticaWatcherMod.Patching.Patcher");
                log($"Removing {instruction.Operand}");
                methodDefinition.Body.GetILProcessor().Remove(instruction);
                log($"Removed {instruction.Operand}");

                log("Saving Assembly.");
                targetAssembly.Write(SubnauticaDllPath);
            }
            catch (Exception ex)
            {
                log($"Error: Exception removing patch: {ex.Message}");
                Logger.Error(ex);
                return -7;
            }
            finally
            {
                Logger.Debug($"Restoring working dir: {initialDirectory}");
                Directory.SetCurrentDirectory(initialDirectory);
            }

            return 0;
        }
    }
}
