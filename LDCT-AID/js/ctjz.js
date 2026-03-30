
document.addEventListener('DOMContentLoaded', function() {
    // ========== 1. 元素获取 ==========
    const ctUploadInput = document.getElementById('ctUploadInput');
    const ctRawPreview = document.getElementById('ctRawPreview');
    const ctDenoisedPreview = document.getElementById('ctDenoisedPreview');
    const ctStatus = document.getElementById('ctStatus');
    const ctMetrics = document.getElementById('ctMetrics');
    const ctSubmitBtn = document.getElementById('ctSubmitBtn');
    const ctDenoiseForm = document.getElementById('ctDenoiseForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const uploadZone = document.querySelector('.upload-zone');
    const processingOverlay = document.getElementById('processingOverlay'); // 替换原来的loadingOverlay
const progressFill = document.getElementById('progressFill'); // 进度条填充层
const progressText = document.getElementById('progressText'); // 进度提示文本

    let uploadedFile = null; // 存储上传的文件
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function updateProgress(progress, text) {
    // 更新进度条宽度（百分比）
    progressFill.style.width = `${progress.toFixed(0)}%`;
    // 更新加载框内的提示文本
    progressText.textContent = text;
    // 同步更新页面上的指标文本（可选，保持你的原有体验）
    ctMetrics.textContent = text;
}
    // ========== 2. 原始图片预览（同之前逻辑） ==========
    ctUploadInput.addEventListener('change', function(e) {
        uploadedFile = e.target.files[0];
        if (uploadedFile) {
            ctStatus.textContent = "已上传";
            ctStatus.className = "status-chip success";
            const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (imageTypes.includes(uploadedFile.type)) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    ctRawPreview.src = event.target.result;
                    ctRawPreview.style.display = "block";
                    ctRawLabel.style.display = "none";
                };
                reader.readAsDataURL(uploadedFile);
            } else {
                ctRawPreview.alt = "暂不支持DCM/NII格式预览";
                alert("DCM/NII格式文件无法直接预览，处理后显示结果！");
            }
        } else {
            ctRawPreview.src = "";
            ctStatus.textContent = "待上传";
            ctStatus.className = "status-chip info";
        }
    });

    // ========== 3. 拖放上传（同之前逻辑） ==========
    uploadZone.addEventListener('dragover', (e) => {e.preventDefault(); uploadZone.style.border = "2px dashed #007bff";});
    uploadZone.addEventListener('dragleave', () => {uploadZone.style.border = "none";});
    uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadZone.style.border = "none";
        uploadedFile = e.dataTransfer.files[0];
        if (uploadedFile) {
            ctUploadInput.files = e.dataTransfer.files;
            ctUploadInput.dispatchEvent(new Event('change'));
        }
    });

    function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 进度更新函数（simulateDetection需要）
function updateProgress(progress, text) {
    // 示例：更新进度条（如果有）+ 状态文本
    console.log(`进度：${progress.toFixed(0)}% - ${text}`);
    ctMetrics.textContent = text; // 把步骤文本显示到指标区域
}

// 模拟后端降噪处理函数（补充实现）
async function processDenoise(file) {
    // 模拟接口请求延迟
    await delay(1000);
    // 返回模拟结果（实际需替换为真实接口返回值）
    return {
        imageUrl: URL.createObjectURL(file), // 用上传文件临时URL模拟降噪后图片
        ssim: Math.random() * 0.1 + 0.9,     // 模拟SSIM值（0.9~1.0）
        psnr: Math.random() * 10 + 30        // 模拟PSNR值（30~40dB）
    };
}

    // ========== 4. 核心：降噪按钮点击事件 ==========
    ctDenoiseForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // 阻止表单默认提交（避免刷新页面）
        
        // 校验：未上传文件则提示
        if (!uploadedFile) {
            alert("请先上传医学影像文件！");
            return;
        }

         // 步骤1：显示加载动画 + 禁用按钮 + 更新状态
    loadingOverlay.style.display = "flex";
    ctSubmitBtn.disabled = true;
    ctStatus.textContent = "处理中";
    ctStatus.className = "status-chip processing";
    ctMetrics.textContent = "SSIM / PSNR 指标计算中...";

    // 定义进度模拟函数（移到调用前，且改为局部函数，去掉this.）
    async function simulateDetection() {
        const steps = [
            '加载医学图像数据...',
            '图像预处理和增强...',
            '运行LEDA降噪算法...',
            'MVFA异常检测中...',
            '多层级特征分析...',
            '生成诊断报告...'
        ];

        for (let i = 0; i < steps.length; i++) {
            const progress = ((i + 1) / steps.length) * 100;
            updateProgress(progress, steps[i]); // 直接调用全局updateProgress，无需this
            await delay(800 + Math.random() * 800); // 直接调用全局delay
        }
    }

        try {
            // 步骤2：异步处理降噪（这里模拟后端请求，实际需替换为真实接口）
            const denoisedResult = await processDenoise(uploadedFile);
            
            // 步骤3：处理完成 - 隐藏加载 + 启用按钮 + 显示结果
            loadingOverlay.style.display = "none";
            ctSubmitBtn.disabled = false;
            ctStatus.textContent = "处理完成";
            ctStatus.className = "status-chip success";
            
            // 渲染降噪后图片
            ctDenoisedPreview.src = denoisedResult.imageUrl;
            ctDenoisedPreview.style.display = "block";
            ctDenoisedLabel.style.display = "none";

            // 渲染指标（模拟数据，实际从后端返回）
            ctMetrics.textContent = `SSIM: ${denoisedResult.ssim.toFixed(4)} / PSNR: ${denoisedResult.psnr.toFixed(2)} dB`;

        } catch (error) {
            // 异常处理
            loadingOverlay.style.display = "none";
            ctSubmitBtn.disabled = false;
            ctStatus.textContent = "处理失败";
            ctStatus.className = "status-chip info";
            ctMetrics.textContent = "处理出错，请重试！";
            alert("降噪处理失败：" + error.message);
        }

  
    });

    // ========== 5. 模拟降噪处理函数（替换为真实后端接口） ==========
    /**
     * 模拟AI降噪接口调用
     * @param {File} file 上传的影像文件
     * @returns {Promise<Object>} 降噪结果（图片地址 + 指标）
     */
    async function processDenoise(file) {
        return new Promise((resolve, reject) => {
            // 模拟后端处理耗时（2-3秒）
            setTimeout(() => {
                const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                if (imageTypes.includes(file.type)) {
                    // 方案1：如果是前端模拟降噪（简单处理，比如灰度化，仅演示）
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.onload = function() {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        // 模拟降噪：转灰度图（实际需用AI模型）
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imageData.data;
                        for (let i = 0; i < data.length; i += 4) {
                            const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
                            data[i] = data[i+1] = data[i+2] = gray;
                        }
                        ctx.putImageData(imageData, 0, 0);
                        // 转换为DataURL返回
                        resolve({
                            imageUrl: canvas.toDataURL(file.type),
                            ssim: Math.random() * 0.1 + 0.9, // 模拟SSIM值（0.9-1.0）
                            psnr: Math.random() * 10 + 30   // 模拟PSNR值（30-40dB）
                        });
                    };
                    img.src = URL.createObjectURL(file);
                    img.src = "images/done.png";
                } else {
                    // 方案2：如果是DCM/NII格式（需后端返回处理后的图片地址）
                    // 实际项目中替换为真实的后端API请求，例如：
                    // const response = await fetch('/api/denoise', {
                    //     method: 'POST',
                    //     body: new FormData(ctDenoiseForm)
                    // });
                    // const result = await response.json();
                    // resolve(result);

                    // 这里模拟返回一张示例图（实际需替换）
                    resolve({
                        imageUrl: "https://example.com/denoised-ct-image.jpg",
                        ssim: 0.9652,
                        psnr: 38.5
                    });
                }
            }, 2000); // 模拟2秒处理时间
        });
    }
});

function setCurrentDate() {
        const now = new Date();
        
        // 获取年、月、日、时、分
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        // 格式化为 2025-02-18 09:42 这种格式
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        
        // 将格式化后的日期写入 ID 为 patientDate 的元素
        document.getElementById('patientDate').textContent = formattedDate;
    }

    // 页面加载完成后立即执行
    window.onload = setCurrentDate;
