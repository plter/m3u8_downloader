// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.


new Vue({
    el: ".root",
    data: {
        m3u8_url: "",
        download_dir: "",
        downloading: false,
        output: ""
    },
    mounted() {
        this.read_url_to_download();
    },
    methods: {
        read_url_to_download() {
            this.m3u8_url = localStorage.getItem("m3u8_url") || "";
            this.download_dir = localStorage.getItem("download_dir") || "";
        },

        async browseForDownloadDir() {
            let r = await electron.remote.dialog.showOpenDialog(electron.remote.getCurrentWindow(), {properties: ["createDirectory", "openDirectory"]});
            if (r.filePaths && r.filePaths.length) {
                this.download_dir = r.filePaths[0];
            }
        },

        async start_download() {

            if (!this.download_dir) {
                alert("请指定下载目录");
                return;
            }

            if (!this.m3u8_url) {
                alert("请指定要下载的 m3u8 文件地址");
                return
            }

            this.downloading = true;
            let base_url = NodePath.dirname(this.m3u8_url);
            let m3u8_file_name = NodePath.basename(this.m3u8_url);
            this.appendLine(`正在分析 ${this.m3u8_url}`);

            let m3u8_res = await fetch(this.m3u8_url);
            let m3u8_content = await m3u8_res.text();
            await fsWriteAsync(NodePath.join(this.download_dir, m3u8_file_name), NodeBuffer.from(m3u8_content));
            let lines = m3u8_content.split("\n");
            let ts_files = lines.filter(v => v.toLowerCase().endsWith(".ts"));

            this.appendLine(`分析完成 ${this.m3u8_url}`);
            for (let f of ts_files) {
                let tsUrl = NodePath.join(base_url, f);
                this.appendLine(`正在下载 ${tsUrl}`);
                let tsReq = await fetch(tsUrl);
                let data = await tsReq.arrayBuffer();
                await fsWriteAsync(NodePath.join(this.download_dir, f), NodeBuffer.from(data));
                this.appendLine(`下载完成 ${tsUrl}`);
            }

            this.downloading = false;
        },

        appendLine(msg) {
            this.output += `${msg}\n`;
            this.$nextTick(v => {
                this.$refs.outputTa.scrollTop = this.$refs.outputTa.scrollHeight;
            });
        }
    },
    watch: {
        m3u8_url(v) {
            localStorage.setItem("m3u8_url", v)
        },

        download_dir(v) {
            localStorage.setItem("download_dir", v)
        }
    }
});