namespace SubnauticaWatcherInstaller
{
    #region imports

    using System;
    using System.Drawing;
    using System.Reflection;
    using System.Windows.Forms;
    using NLog;

    #endregion

    public partial class MainForm : Form
    {
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        public MainForm()
        {
            InitializeComponent();
            versionLabel.Text = $"v{ThisAssembly.AssemblyVersion}";
            versionLabelTooltip.SetToolTip(versionLabel, ThisAssembly.AssemblyInformationalVersion);

            Log($"Application Start - v{ThisAssembly.AssemblyInformationalVersion}");
            Installer = new Installer(Log);
            
            // Disable buttons if paths invalid
            if (Installer.ValidatePaths() == 0) return;
            installButton.Enabled = false;
            uninstallButton.Enabled = false;
        }

        internal Installer Installer { get; }

        internal void Log(string message)
        {
            messageBox.Items.Add(
                new ListViewItem
                {
                    Text = message,
                    ToolTipText = message,
                    BackColor = message.StartsWith("Error", StringComparison.InvariantCultureIgnoreCase)
                                    ? Color.OrangeRed
                                    : Color.White
                });

            Logger.Log(
                message.StartsWith("Error", StringComparison.InvariantCultureIgnoreCase)
                    ? LogLevel.Error
                    : LogLevel.Info,
                message);
        }

        private void mainForm_Shown(object sender, EventArgs e)
        {
            UpdateInstallStatus();
        }

        private void UpdateInstallStatus()
        {
            if (Installer.IsPatched)
            {
                installStatus.Text = "Installed";
                installStatus.BackColor = Color.LawnGreen;
                installButton.Enabled = false;
                uninstallButton.Enabled = true;
            }
            else
            {
                installStatus.Text = "Not Installed";
                installStatus.BackColor = Color.OrangeRed;
                installButton.Enabled = true;
                uninstallButton.Enabled = false;
            }
        }

        private void installButton_Click(object sender, EventArgs e)
        {
            Installer.Install();
            UpdateInstallStatus();
        }

        private void uninstallButton_Click(object sender, EventArgs e)
        {
            Installer.Uninstall();
            UpdateInstallStatus();
        }

        private void messageBox_SelectedIndexChanged(object sender, EventArgs e)
        {

        }

        private void MainForm_FormClosed(object sender, FormClosedEventArgs e)
        {
            Logger.Info("Application Exited.");
        }
    }
}
