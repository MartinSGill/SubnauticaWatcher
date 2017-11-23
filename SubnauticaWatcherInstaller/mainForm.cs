namespace SubnauticaWatcherInstaller
{
    #region imports

    using System;
    using System.Drawing;
    using System.Windows.Forms;

    #endregion

    public partial class MainForm : Form
    {
        public MainForm()
        {
            InitializeComponent();
            Log("Program Start.");
            Installer = new Installer(Log);

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
    }
}
