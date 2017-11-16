using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace SubnauticaWatcherInstaller
{
    public partial class mainForm : Form
    {
        public mainForm()
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
            messageBox.Items.Add(message);
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
    }
}
