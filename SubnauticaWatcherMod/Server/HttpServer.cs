namespace SubnauticaWatcherMod.Server
{
    #region imports

    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Net;
    using System.Reflection;
    using UnityEngine;

    #endregion

    internal class HttpServer
    {
        private static readonly string[] DefaultDocuments =
        {
            "index.html",
            "index.htm",
            "default.html",
            "default.htm"
        };

        private static readonly IDictionary<string, string> MimeTypeMappings =
            new Dictionary<string, string>(StringComparer.InvariantCultureIgnoreCase)
            {
                #region extension to MIME type list

                {".asf", "video/x-ms-asf"},
                {".asx", "video/x-ms-asf"},
                {".avi", "video/x-msvideo"},
                {".bin", "application/octet-stream"},
                {".cco", "application/x-cocoa"},
                {".crt", "application/x-x509-ca-cert"},
                {".css", "text/css"},
                {".deb", "application/octet-stream"},
                {".der", "application/x-x509-ca-cert"},
                {".dll", "application/octet-stream"},
                {".dmg", "application/octet-stream"},
                {".ear", "application/java-archive"},
                {".eot", "application/octet-stream"},
                {".exe", "application/octet-stream"},
                {".flv", "video/x-flv"},
                {".gif", "image/gif"},
                {".hqx", "application/mac-binhex40"},
                {".htc", "text/x-component"},
                {".htm", "text/html"},
                {".html", "text/html"},
                {".ico", "image/x-icon"},
                {".img", "application/octet-stream"},
                {".iso", "application/octet-stream"},
                {".jar", "application/java-archive"},
                {".jardiff", "application/x-java-archive-diff"},
                {".jng", "image/x-jng"},
                {".jnlp", "application/x-java-jnlp-file"},
                {".jpeg", "image/jpeg"},
                {".jpg", "image/jpeg"},
                {".js", "application/x-javascript"},
                {".mml", "text/mathml"},
                {".mng", "video/x-mng"},
                {".mov", "video/quicktime"},
                {".mp3", "audio/mpeg"},
                {".mpeg", "video/mpeg"},
                {".mpg", "video/mpeg"},
                {".msi", "application/octet-stream"},
                {".msm", "application/octet-stream"},
                {".msp", "application/octet-stream"},
                {".pdb", "application/x-pilot"},
                {".pdf", "application/pdf"},
                {".pem", "application/x-x509-ca-cert"},
                {".pl", "application/x-perl"},
                {".pm", "application/x-perl"},
                {".png", "image/png"},
                {".prc", "application/x-pilot"},
                {".ra", "audio/x-realaudio"},
                {".rar", "application/x-rar-compressed"},
                {".rpm", "application/x-redhat-package-manager"},
                {".rss", "text/xml"},
                {".run", "application/x-makeself"},
                {".sea", "application/x-sea"},
                {".shtml", "text/html"},
                {".sit", "application/x-stuffit"},
                {".swf", "application/x-shockwave-flash"},
                {".tcl", "application/x-tcl"},
                {".tk", "application/x-tcl"},
                {".txt", "text/plain"},
                {".war", "application/java-archive"},
                {".wbmp", "image/vnd.wap.wbmp"},
                {".wmv", "video/x-ms-wmv"},
                {".xml", "text/xml"},
                {".xpi", "application/x-xpinstall"},
                {".zip", "application/zip"},

                #endregion
            };

        private readonly HttpListener _listener = new HttpListener();
        private readonly string _rootDirectory;

        public HttpServer()
        {
            try
            {
                Log("Initialising HTTP Server.");
                Log($"Assembly Path: {Assembly.GetExecutingAssembly().Location}");
                Log($"DirName: {Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)}");
                _rootDirectory = Path.Combine(
                    Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)
                    ?? throw new InvalidOperationException(),
                    @"map");
                Log($"Root Dir: @{_rootDirectory}");
            }
            catch (InvalidOperationException)
            {
                Log("Unable to determine root directory.");
                throw;
            }
        }

        ~HttpServer()
        {
            if (!_listener.IsListening) return;
            _listener.Stop();
            _listener.Close();
        }

        private static void Log(string message)
        {
            Debug.Log($"[SNWatcher HTTP] {message}");
        }

        public void Start()
        {
            Log("Starting HTTP Server");
            const string address = "http://*:63030/";
            _listener.Prefixes.Add(address);
            _listener.Start();
            Log($"Listening on: {address}");
            _listener.BeginGetContext(GetContextCallback, null);
        }

        private void ServeFile(HttpListenerContext context)
        {
            var filename = context.Request.Url.AbsolutePath;
            Console.WriteLine(filename);

            filename = filename.Substring(1);

            if (string.IsNullOrEmpty(filename))
                foreach (var indexFile in DefaultDocuments)
                {
                    if (File.Exists(Path.Combine(_rootDirectory, indexFile)))
                    {
                        filename = indexFile;
                        break;
                    }
                }


            filename = Path.Combine(_rootDirectory, filename);

            if (File.Exists(filename))
            {
                try
                {
                    Log($"Serving: {filename}");
                    Stream input = new FileStream(filename, FileMode.Open);
                    context.Response.StatusCode = (int)HttpStatusCode.OK;

                    //Adding permanent http response headers
                    Log($"Set Headers");
                    context.Response.ContentType =
                        MimeTypeMappings.TryGetValue(Path.GetExtension(filename), out var mime)
                            ? mime
                            : "application/octet-stream";
                    context.Response.ContentLength64 = input.Length;
                    context.Response.AddHeader("Date", DateTime.Now.ToString("r"));
                    context.Response.AddHeader("Last-Modified", File.GetLastWriteTime(filename).ToString("r"));

                    Log($"Stream Content");
                    var buffer = new byte[1024 * 32];
                    int nbytes;
                    while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0)
                    {
                        context.Response.OutputStream.Write(buffer, 0, nbytes);
                    }
                    input.Close();
                    Log($"Flush Content");
                    context.Response.OutputStream.Flush();
                }
                catch (Exception ex)
                {
                    Log($"Internal Server Error: {ex.Message}");
                    context.Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                }
            }
            else
            {
                Log($"File not found: {filename}");
                context.Response.StatusCode = (int) HttpStatusCode.NotFound;
            }

            context.Response.OutputStream.Close();
        }

        public void GetContextCallback(IAsyncResult result)
        {
            Log("Received Request");
            var context = _listener.EndGetContext(result);
            ServeFile(context);
            _listener.BeginGetContext(GetContextCallback, null);
        }
    }
}
