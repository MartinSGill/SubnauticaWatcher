namespace SubnauticaWatcherInstaller
{
    partial class mainForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.installStatus = new System.Windows.Forms.Label();
            this.installButton = new System.Windows.Forms.Button();
            this.uninstallButton = new System.Windows.Forms.Button();
            this.messageBox = new System.Windows.Forms.ListView();
            this.SuspendLayout();
            // 
            // installStatus
            // 
            this.installStatus.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.installStatus.Dock = System.Windows.Forms.DockStyle.Top;
            this.installStatus.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.installStatus.Font = new System.Drawing.Font("Microsoft Sans Serif", 18F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.installStatus.Location = new System.Drawing.Point(0, 0);
            this.installStatus.Name = "installStatus";
            this.installStatus.Size = new System.Drawing.Size(452, 51);
            this.installStatus.TabIndex = 0;
            this.installStatus.Text = "Not Installed";
            this.installStatus.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // installButton
            // 
            this.installButton.Location = new System.Drawing.Point(13, 64);
            this.installButton.Name = "installButton";
            this.installButton.Size = new System.Drawing.Size(75, 23);
            this.installButton.TabIndex = 2;
            this.installButton.Text = "Install";
            this.installButton.UseVisualStyleBackColor = true;
            this.installButton.Click += new System.EventHandler(this.installButton_Click);
            // 
            // uninstallButton
            // 
            this.uninstallButton.Location = new System.Drawing.Point(365, 64);
            this.uninstallButton.Name = "uninstallButton";
            this.uninstallButton.Size = new System.Drawing.Size(75, 23);
            this.uninstallButton.TabIndex = 3;
            this.uninstallButton.Text = "Uninstall";
            this.uninstallButton.UseVisualStyleBackColor = true;
            this.uninstallButton.Click += new System.EventHandler(this.uninstallButton_Click);
            // 
            // messageBox
            // 
            this.messageBox.BackColor = System.Drawing.Color.White;
            this.messageBox.ForeColor = System.Drawing.Color.Black;
            this.messageBox.FullRowSelect = true;
            this.messageBox.GridLines = true;
            this.messageBox.Location = new System.Drawing.Point(12, 93);
            this.messageBox.Name = "messageBox";
            this.messageBox.ShowItemToolTips = true;
            this.messageBox.Size = new System.Drawing.Size(428, 156);
            this.messageBox.TabIndex = 4;
            this.messageBox.UseCompatibleStateImageBehavior = false;
            this.messageBox.View = System.Windows.Forms.View.List;
            // 
            // mainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(452, 261);
            this.Controls.Add(this.messageBox);
            this.Controls.Add(this.uninstallButton);
            this.Controls.Add(this.installButton);
            this.Controls.Add(this.installStatus);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedToolWindow;
            this.Name = "mainForm";
            this.RightToLeft = System.Windows.Forms.RightToLeft.No;
            this.Text = "SubnauticaWatcher Installer";
            this.Shown += new System.EventHandler(this.mainForm_Shown);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Label installStatus;
        private System.Windows.Forms.Button installButton;
        private System.Windows.Forms.Button uninstallButton;
        private System.Windows.Forms.ListView messageBox;
    }
}

