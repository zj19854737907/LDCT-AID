// 应用程序主要功能
class LDCTAIDApp {
    constructor() {
        this.currentFiles = [];
        this.isProcessing = false;
        this.anomalies = [];
        this.selectedOrgan = null;
        this.currentSlice = 5;
        this.totalSlices = 8;
        this.hasDetected = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSampleData();
        this.generateSlices();
        this.initSliceFilters(); // 初始化过滤器
        this.initResponsiveHandling(); // 添加响应式处理
   // 确保主界面显示
    document.getElementById('dashboard').style.display = 'block';
    }

    bindEvents() {
        // // 登录表单提交
        // document.getElementById('loginForm').addEventListener('submit', (e) => {
        //     e.preventDefault();
        //     this.handleLogin();
        // });

        // 器官选择
        document.querySelectorAll('.organ-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectOrgan(option);
            });
        });

        // 文件上传相关事件
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#0066FF';
            dropZone.style.background = 'rgba(0, 102, 255, 0.1)';
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = '#334155';
            dropZone.style.background = 'rgba(255,255,255,0.02)';
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#334155';
            dropZone.style.background = 'rgba(255,255,255,0.02)';
            this.handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // 置信度阈值滑块
        const thresholdSlider = document.getElementById('confidenceThreshold');
        const thresholdValue = document.getElementById('thresholdValue');
        thresholdSlider.addEventListener('input', (e) => {
            thresholdValue.textContent = e.target.value;
        });

        // 开始检测按钮
        document.getElementById('startDetection').addEventListener('click', () => {
            this.startDetection();
        });

        // 导出报告按钮
        document.getElementById('exportReport').addEventListener('click', () => {
            this.exportReport();
        });

        // AI助手发送消息
        // document.getElementById('sendMessage').addEventListener('click', () => {
        //     this.sendMessage();
        // });

        // document.getElementById('chatInput').addEventListener('keypress', (e) => {
        //     if (e.key === 'Enter') {
        //         this.sendMessage();
        //     }
        // });

        // 切片点击事件
        document.getElementById('slicesGrid').addEventListener('click', (e) => {
            const sliceItem = e.target.closest('.slice-item');
            if (sliceItem) {
                this.selectSlice(sliceItem);
            }
        });
    }

    selectOrgan(option) {
        // 移除之前的选择
        document.querySelectorAll('.organ-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // 设置新的选择
        option.classList.add('selected');
        this.selectedOrgan = option.dataset.organ;
        
        this.showNotification(`已选择器官: ${option.textContent.trim()}`);
        this.updateOrganSpecificSettings();
    }

    updateOrganSpecificSettings() {
        const settings = {
            'brain': { mode: 'zero-shot', threshold: 0.8 },
            'chest': { mode: 'auto', threshold: 0.7 },
            'liver': { mode: 'few-shot', threshold: 0.75 },
            'retina_oct': { mode: 'zero-shot', threshold: 0.85 },
            'retina_resc': { mode: 'auto', threshold: 0.8 },
            'histopathology': { mode: 'few-shot', threshold: 0.7 }
        };

        if (this.selectedOrgan && settings[this.selectedOrgan]) {
            const setting = settings[this.selectedOrgan];
            document.getElementById('detectionMode').value = setting.mode;
            document.getElementById('confidenceThreshold').value = setting.threshold;
            document.getElementById('thresholdValue').textContent = setting.threshold;
        }
    }

    generateSlices() {
        const slicesGrid = document.getElementById('slicesGrid');
        slicesGrid.innerHTML = '';

        for (let i = 1; i <= this.totalSlices; i++) {
            const sliceItem = document.createElement('div');
            sliceItem.className = `slice-item ${i === this.currentSlice ? 'active' : ''}`;
            sliceItem.dataset.slice = i;
            sliceItem.innerHTML = `
                <i class="fas fa-image"></i>
                <div class="slice-number">${i}</div>
            `;
            slicesGrid.appendChild(sliceItem);
        }
    }

    selectSlice(sliceItem) {
        // 移除之前的选择
        document.querySelectorAll('.slice-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 设置新的选择
        sliceItem.classList.add('active');
        this.currentSlice = parseInt(sliceItem.dataset.slice);
        
        this.updateSliceDisplay();
    }

    updateSliceDisplay() {
        const originalImage = document.getElementById('originalImage');
        const detectionImage = document.getElementById('detectionImage');
        
        if (this.currentFiles.length > 0) {
            originalImage.innerHTML = `
                <div style="text-align: center; color: #fff;">
                    <i class="fas fa-check-circle" style="color: #2ed573; font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>切片 ${this.currentSlice}</p>
                    <p style="font-size: 0.8rem; opacity: 0.7;">已加载医学图像</p>
                </div>
            `;
            
            detectionImage.innerHTML = `
                <div style="text-align: center; color: #fff;">
                    <i class="fas fa-search" style="color: #0066FF; font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>等待分析结果</p>
                </div>
            `;
        }
    }

    // handleLogin() {
    //     const username = document.getElementById('username').value;
    //     const password = document.getElementById('password').value;
        
    //     // 简单验证
    //     if (username && password) {
    //         document.getElementById('loginPage').style.display = 'none';
    //         document.getElementById('dashboard').style.display = 'block';
    //         this.showNotification('登录成功！欢迎使用LDCT-AID系统。');
    //     }
    // }
// 修改创建切片方法中的图片处理
createSlice(file, index) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const slicesGrid = document.getElementById('slicesGrid');
        
        const sliceItem = document.createElement('div');
        sliceItem.className = `slice-item ${index === 0 ? 'active' : ''}`;
        sliceItem.dataset.slice = index;
        sliceItem.dataset.fileIndex = index;
        
        // 创建图片容器
        const imgContainer = document.createElement('div');
        imgContainer.style.width = '100%';
        imgContainer.style.height = '100%';
        imgContainer.style.overflow = 'hidden';
        imgContainer.style.borderRadius = '4px';
        imgContainer.style.position = 'relative';
        
        // 创建图片
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover'; // 切片使用cover保持填充
        
        // 切片编号
        const sliceNumber = document.createElement('div');
        sliceNumber.className = 'slice-number';
        sliceNumber.textContent = index + 1;
        
        imgContainer.appendChild(img);
        sliceItem.appendChild(imgContainer);
        sliceItem.appendChild(sliceNumber);
        
        // 点击事件
        sliceItem.addEventListener('click', () => {
            this.selectSlice(sliceItem);
            this.previewImage(file, index);
        });
        
        slicesGrid.appendChild(sliceItem);
        
        // 为这个切片随机生成一些异常标记（模拟）
        // if (Math.random() > 0.3) { // 70%的切片有异常
        //     this.addAnomalyMarkers(sliceItem, index);
        // }
    };
    reader.readAsDataURL(file);
}
// 在类中添加响应式处理方法
initResponsiveHandling() {
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        // 如果当前有选中的图片，重新绘制检测结果
        const activeSlice = document.querySelector('.slice-item.active');
        if (activeSlice) {
            const fileIndex = parseInt(activeSlice.dataset.fileIndex);
            if (this.currentFiles[fileIndex]) {
                this.reloadCurrentImage();
            }
        }
    });
}

// 重新加载当前图片
reloadCurrentImage() {
    const activeSlice = document.querySelector('.slice-item.active');
    if (activeSlice && this.currentFiles.length > 0) {
        const fileIndex = parseInt(activeSlice.dataset.fileIndex);
        const file = this.currentFiles[fileIndex];
        this.previewImage(file, fileIndex);
    }
}
// 添加异常标记
addAnomalyMarkers(sliceItem, fileIndex) {
    const anomalyCount = Math.floor(Math.random() * 3) + 1; // 1-3个异常
    
    for (let i = 0; i < anomalyCount; i++) {
        const marker = document.createElement('div');
        marker.className = 'anomaly-marker';
        marker.style.top = `${10 + Math.random() * 70}%`;
        marker.style.left = `${10 + Math.random() * 70}%`;
        
        // 异常信息
        const tooltip = document.createElement('div');
        tooltip.className = 'anomaly-tooltip';
        tooltip.textContent = this.generateAnomalyInfo(fileIndex, i);
        
        marker.appendChild(tooltip);
        sliceItem.appendChild(marker);
        
        // 点击标记显示详情
        marker.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止触发切片点击事件
            this.showAnomalyDetail(fileIndex, i);
        });
    }
    
    // 标记这个切片有异常
    sliceItem.dataset.hasAnomaly = 'true';
}
// 生成异常信息
generateAnomalyInfo(fileIndex, anomalyIndex) {
    const types = ['结节', '阴影', '钙化', '肿块', '磨玻璃影'];
    const sizes = ['3.2mm', '5.1mm', '8.7mm', '12.3mm', '15.6mm'];
    const risks = ['低危', '中危', '高危'];
    
    return `${types[anomalyIndex % types.length]} ${sizes[fileIndex % sizes.length]} ${risks[anomalyIndex % risks.length]}`;
}

// 显示异常详情
showAnomalyDetail(fileIndex, anomalyIndex) {
    const anomalyInfo = this.generateAnomalyInfo(fileIndex, anomalyIndex);
    this.showNotification(`异常详情: ${anomalyInfo}`, 'info');
    
    // 在AI助手中显示详情
    this.addAIMessage(`发现异常: ${anomalyInfo}，建议进一步检查确认。`);
}

// 高亮所有异常
highlightAllAnomalies() {
    const slices = document.querySelectorAll('.slice-item');
    let anomalyCount = 0;
    
    slices.forEach(slice => {
        if (slice.dataset.hasAnomaly === 'true') {
            slice.style.boxShadow = '0 0 0 3px #ff4757';
            slice.style.borderColor = '#ff4757';
            anomalyCount++;
        }
    });
    
    this.showNotification(`已标记 ${anomalyCount} 个包含异常的切片`, 'success');
}

// 清除所有标记
clearAllMarkers() {
    const slices = document.querySelectorAll('.slice-item');
    
    slices.forEach(slice => {
        slice.style.boxShadow = '';
        slice.style.borderColor = '';
    });
    
    this.showNotification('已清除所有异常标记', 'info');
}

// 清空切片
clearSlices() {
    const slicesGrid = document.getElementById('slicesGrid');
    slicesGrid.innerHTML = '';
}
   handleFiles(files) {
    if (files.length === 0) return;

    this.currentFiles = Array.from(files);
    this.updateFileList();
    
    // 清空之前的切片
    this.clearSlices();
    
    // 为每个文件创建切片
    this.currentFiles.forEach((file, index) => {
        this.createSlice(file, index);
    });
    
    // 预览第一个文件
    if (files[0]) {
        this.previewImage(files[0], 0);
    }
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        this.currentFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-name">${file.name}</div>
                <div class="file-size">${this.formatFileSize(file.size)}</div>
                <div class="file-remove" onclick="app.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </div>
            `;
            fileList.appendChild(fileItem);
        });
    }

    removeFile(index) {
        this.currentFiles.splice(index, 1);
        this.updateFileList();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async startDetection() {
        const hintText = document.getElementById('startDetection');
        if (!this.selectedOrgan) {
            this.showNotification('请先选择检测器官', 'error');
            alert('请先选择检测器官！');
        
            return;
        }

        if (this.currentFiles.length === 0) {
            this.showNotification('请先上传医学图像文件', 'error');
            alert('请先上传文件！');

            return;
        }

        if (this.isProcessing) return;

        this.isProcessing = true;
        this.showProcessingOverlay();

        try {
            // 模拟检测过程
            await this.simulateDetection();
            this.hasDetected = true;
            this.reloadCurrentImage();
            // 显示结果
            this.displayResults();
            
            this.showNotification('医学图像分析完成！', 'success');
        } catch (error) {
            this.showNotification('分析过程中出现错误: ' + error.message, 'error');
        } finally {
            this.hideProcessingOverlay();
            this.isProcessing = false;
        }
    }

    async simulateDetection() {
        const steps = [
            '加载医学图像数据...',
            '图像预处理和增强...',

            'MVFA异常检测中...',
            '多层级特征分析...',
            '生成诊断报告...'
        ];

        for (let i = 0; i < steps.length; i++) {
            const progress = ((i + 1) / steps.length) * 100;
            this.updateProgress(progress, steps[i]);
            await this.delay(800 + Math.random() * 800);
        }
    }

    displayResults() {
        // 更新统计信息
        document.getElementById('highRiskCount').textContent = '2';
        document.getElementById('mediumRiskCount').textContent = '1';
        document.getElementById('confidenceScore').textContent = '94%';
        const sliceItems = document.querySelectorAll('.slice-item');
            sliceItems.forEach((sliceItem, index) => {
                // 模拟：如果是检测后，我们随机给某些切片打上标记
                if (Math.random() > 0.4) { 
                    this.addAnomalyMarkers(sliceItem, index);
                }
            });
                // 显示异常列表
                this.displayAnomalies();

                // 更新图像显示
                this.updateResultDisplay();

                // AI助手自动回复
                this.addAIMessage(`检测完成！共发现3处异常区域，其中2处需要重点关注。器官: ${this.getOrganName(this.selectedOrgan)}`);
            }

    getOrganName(organKey) {
        const names = {
            'brain': '脑部',
            'chest': '胸部',
            'liver': '肝脏',
            'retina_oct': '视网膜(OCT2017)',
            'retina_resc': '视网膜(RESC)',
            'histopathology': '组织病理'
        };
        return names[organKey] || organKey;
    }

    displayAnomalies() {
        const container = document.getElementById('anomaliesContainer');
        container.innerHTML = '';

        const sampleAnomalies = [
            {
                id: 'ANO-001',
                type: this.getOrganAnomalyType(this.selectedOrgan),
                location: this.getOrganLocation(this.selectedOrgan),
                size: '12.8×10.3mm',
                confidence: 94,
                risk: 'high',
                suggestion: '建议进一步检查'
            },
            {
                id: 'ANO-002',
                type: this.getOrganAnomalyType(this.selectedOrgan, 1),
                location: this.getOrganLocation(this.selectedOrgan, 1),
                size: '8.5×7.2mm',
                confidence: 87,
                risk: 'high',
                suggestion: '定期复查'
            },
            {
                id: 'ANO-003',
                type: this.getOrganAnomalyType(this.selectedOrgan, 2),
                location: this.getOrganLocation(this.selectedOrgan, 2),
                size: '3.2×2.8mm',
                confidence: 76,
                risk: 'medium',
                suggestion: '年度随访'
            }
        ];

        sampleAnomalies.forEach(anomaly => {
            const anomalyElement = document.createElement('div');
            anomalyElement.className = `anomaly-item ${anomaly.risk}-risk`;
            anomalyElement.innerHTML = `
                <div class="anomaly-marker"></div>
                <div class="anomaly-info">
                    <div class="anomaly-type">${anomaly.type}</div>
                    <div class="anomaly-location">${anomaly.location}</div>
                    <div class="anomaly-size">尺寸: ${anomaly.size}</div>
                </div>
                <div class="anomaly-confidence">
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${anomaly.confidence}%;"></div>
                    </div>
                    <span>${anomaly.confidence}%</span>
                </div>
            `;
            container.appendChild(anomalyElement);
        });
    }

    getOrganAnomalyType(organ, index = 0) {
        const types = {
            'brain': ['脑肿瘤', '脑血管病变', '脑萎缩'],
            'chest': ['肺结节', '磨玻璃影', '胸膜增厚'],
            'liver': ['肝囊肿', '肝血管瘤', '脂肪肝'],
            'retina_oct': ['黄斑水肿', '视网膜脱落', '青光眼'],
            'retina_resc': ['糖尿病视网膜病变', '高血压视网膜病变', '视网膜出血'],
            'histopathology': ['细胞异型', '炎症浸润', '组织坏死']
        };
        return types[organ] ? types[organ][index] || types[organ][0] : '异常病变';
    }

    getOrganLocation(organ, index = 0) {
        const locations = {
            'brain': ['右额叶', '左顶叶', '小脑'],
            'chest': ['右上肺叶', '左下肺叶', '右下肺叶'],
            'liver': ['肝右叶', '肝左叶', '肝门区'],
            'retina_oct': ['黄斑区', '视网膜周边', '视神经盘'],
            'retina_resc': ['后极部', '中周部', '周边部'],
            'histopathology': ['组织表层', '组织中层', '组织深层']
        };
        return locations[organ] ? locations[organ][index] || locations[organ][0] : '特定区域';
    }

    updateResultDisplay() {
        const detectionImage = document.getElementById('detectionImage');
        detectionImage.innerHTML = `
            <div style="text-align: center; color: #fff; padding: 1rem;">
                <div style="background: linear-gradient(135deg, #0066FF, #7736FF); color: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                    <i class="fas fa-check-circle" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                    <h4>检测完成</h4>
                    <p>发现3处异常区域</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem;">
                    <div style="background: #ff4757; color: white; padding: 0.3rem; border-radius: 4px;">高危: 2</div>
                    <div style="background: #ffa502; color: white; padding: 0.3rem; border-radius: 4px;">中危: 1</div>
                </div>
            </div>
        `;
    }

    exportReport() {
        this.showNotification('正在生成诊断报告...', 'info');
        
        // 模拟报告生成
        setTimeout(() => {
            const reportData = this.generateReportData();
            this.downloadReport(reportData);
            this.showNotification('诊断报告已生成并下载', 'success');
        }, 2000);
    }

    generateReportData() {
        return {
            patientInfo: {
                id: document.getElementById('patientId').value || '未填写',
                name: document.getElementById('patientName').value || '未填写',
                age: document.getElementById('patientAge').value || '未填写',
                gender: document.getElementById('patientGender').value || '未填写',
                symptoms: document.getElementById('patientSymptoms').value || '未填写'
            },
            organInfo: {
                selected: this.selectedOrgan,
                name: this.getOrganName(this.selectedOrgan)
            },
            detectionResults: {
                totalAnomalies: 3,
                highRisk: 2,
                mediumRisk: 1,
                confidence: 94,
                processingTime: '3.8s',
                algorithm: 'MVFA-v2.1 + LEDA-v1.5'
            },
            timestamp: new Date().toLocaleString('zh-CN')
        };
    }

    downloadReport(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LDCT诊断报告_${this.selectedOrgan}_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // 添加用户消息
        this.addUserMessage(message);
        input.value = '';

        // AI回复
        setTimeout(() => {
            this.generateAIResponse(message);
        }, 1000);
    }

    addUserMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.innerHTML = `
            <div class="message-content">
                ${message}
            </div>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    addAIMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message ai-message';
        messageElement.innerHTML = `
            <div class="message-content">
                ${message}
            </div>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    generateAIResponse(userMessage) {
        let response = '';
        
        if (userMessage.includes('结节') || userMessage.includes('肿瘤')) {
            response = `根据MVFA算法分析，${this.getOrganName(this.selectedOrgan)}检测到的病变具有较高的恶性风险特征（94%置信度）。建议进行进一步检查以确认诊断。`;
        } else if (userMessage.includes('风险') || userMessage.includes('危险')) {
            response = `当前${this.getOrganName(this.selectedOrgan)}检测结果显示2处高危异常和1处中危异常。高危异常需要立即关注，建议尽快安排进一步检查。`;
        } else if (userMessage.includes('治疗') || userMessage.includes('建议')) {
            response = `基于${this.getOrganName(this.selectedOrgan)}检测结果，建议：1. 立即进行专业医学评估；2. 定期复查监测变化；3. 结合临床症状综合判断。`;
        } else {
            response = `我是LDCT-AID智能诊断助手，专注于${this.getOrganName(this.selectedOrgan)}图像分析。我可以帮您分析医学图像异常、评估风险等级并提供临床建议。`;
        }

        this.addAIMessage(response);
    }

    showProcessingOverlay() {
        document.getElementById('processingOverlay').style.display = 'flex';
    }

    hideProcessingOverlay() {
        document.getElementById('processingOverlay').style.display = 'none';
    }

    updateProgress(percent, text) {
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressText').textContent = text;
    }

    showNotification(message, type = 'info') {
        // 简单的通知实现
        const colors = {
            info: '#0066FF',
            success: '#2ed573',
            error: '#ff4757',
            warning: '#ffa502'
        };
        
        console.log(`%c${type.toUpperCase()}: ${message}`, `color: ${colors[type] || colors.info}; font-weight: bold;`);
    }

    loadSampleData() {
        // 可以加载示例数据
        console.log('LDCT-AID系统初始化完成');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

// 修改预览图像方法
previewImage(file, index) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const originalImage = document.getElementById('originalImage');
        
        // 清空之前的内容
        originalImage.innerHTML = '';
        
        // 创建图片容器
        const imgContainer = document.createElement('div');
        imgContainer.style.width = '100%';
        imgContainer.style.height = '100%';
        imgContainer.style.display = 'flex';
        imgContainer.style.alignItems = 'center';
        imgContainer.style.justifyContent = 'center';
        imgContainer.style.overflow = 'hidden';
        
        // 创建图片预览
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '4px';
        
        imgContainer.appendChild(img);
        originalImage.appendChild(imgContainer);
        
        // 更新检测结果图像
        this.updateDetectionImage(e.target.result, index);
    };
    reader.readAsDataURL(file);
}

// 修改更新检测结果图像方法
updateDetectionImage(imageSrc, fileIndex) {
    const detectionImage = document.getElementById('detectionImage');
    
    // 清空之前的内容
    detectionImage.innerHTML = '';
    
    // 创建画布容器
    const canvasContainer = document.createElement('div');
    canvasContainer.style.width = '100%';
    canvasContainer.style.height = '100%';
    canvasContainer.style.display = 'flex';
    canvasContainer.style.alignItems = 'center';
    canvasContainer.style.justifyContent = 'center';
    canvasContainer.style.overflow = 'hidden';
    
    // 创建画布
    const canvas = document.createElement('canvas');
    canvas.className = 'detection-canvas';
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
        // 计算适合容器的尺寸
        const containerWidth = detectionImage.clientWidth - 20; // 减去内边距
        const containerHeight = detectionImage.clientHeight - 20;
        
        let drawWidth = img.width;
        let drawHeight = img.height;
        
        // 等比例缩放
        const scale = Math.min(
            containerWidth / img.width,
            containerHeight / img.height,
            1 // 最大缩放比例为1（不放大）
        );
        
        drawWidth = img.width * scale;
        drawHeight = img.height * scale;
        
        // 设置画布尺寸
        canvas.width = drawWidth;
        canvas.height = drawHeight;
        
        // 绘制图像
        ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
        
        // 模拟异常区域标记（红色圆圈）
        if (this.hasDetected && Math.random() > 0.2) { // 80%的概率显示异常
            ctx.strokeStyle = '#ff4757';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                drawWidth * (0.3 + Math.random() * 0.4),
                drawHeight * (0.3 + Math.random() * 0.4),
                Math.min(drawWidth, drawHeight) * 0.08, // 根据画布大小调整圆圈大小
                0,
                2 * Math.PI
            );
            ctx.stroke();
            
            // 添加异常文字
            ctx.fillStyle = '#ff4757';
            ctx.font = `bold ${Math.max(12, drawWidth * 0.02)}px Arial`; // 根据画布大小调整字体
            ctx.fillText('异常区域', 10, 20);
        }
        
        canvasContainer.appendChild(canvas);
        detectionImage.appendChild(canvasContainer);
    };
    
    img.src = imageSrc;
}


// 添加切片过滤功能
initSliceFilters() {
    document.querySelectorAll('.slice-controls .control-btn[data-filter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // 移除其他按钮的active状态
            document.querySelectorAll('.slice-controls .control-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // 设置当前按钮为active
            e.target.classList.add('active');
            
            // 过滤切片
            this.filterSlices(e.target.dataset.filter);
        });
    });
}

// 过滤切片
filterSlices(filter) {
    const slices = document.querySelectorAll('.slice-item');
    
    slices.forEach(slice => {
        switch(filter) {
            case 'all':
                slice.style.display = 'flex';
                break;
            case 'anomaly':
                slice.style.display = slice.dataset.hasAnomaly === 'true' ? 'flex' : 'none';
                break;
            case 'normal':
                slice.style.display = slice.dataset.hasAnomaly === 'true' ? 'none' : 'flex';
                break;
        }
    });
}
updateSlicePreviews(imageData) {
    const slicesGrid = document.getElementById('slicesGrid');
    const sliceItems = slicesGrid.querySelectorAll('.slice-item');
    
    sliceItems.forEach((sliceItem, index) => {
        // 为每个切片创建缩略图
        const img = document.createElement('img');
        img.src = imageData;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        img.style.opacity = '0.8';
        
        // 清空切片内容并添加图片
        sliceItem.innerHTML = '';
        sliceItem.appendChild(img);
        
        // 添加切片编号
        const sliceNumber = document.createElement('div');
        sliceNumber.className = 'slice-number';
        sliceNumber.textContent = index + 1;
        sliceItem.appendChild(sliceNumber);
    });
}

    // 快速动作方法
quickAction(action) {
    switch(action) {
        case 'newPatient':
            this.clearPatientInfo();
            this.showNotification('已清空患者信息，可以开始新诊断');
            break;
        case 'loadTemplate':
            this.loadTemplate();
            break;
        case 'batchProcess':
            this.showNotification('批量处理功能开发中');
            break;
        case 'history':
            this.showNotification('历史记录功能开发中');
            break;
    }
}

clearPatientInfo() {
    document.getElementById('patientId').value = '';
    document.getElementById('patientName').value = '';
    document.getElementById('patientGender').value = '';
    document.getElementById('patientAge').value = '';
    document.getElementById('patientSymptoms').value = '';
    this.currentFiles = [];
    this.updateFileList();
    
    // 重置图像显示
    document.getElementById('originalImage').innerHTML = `
        <div style="text-align: center;">
            <i class="fas fa-file-image" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>等待上传图像</p>
        </div>
    `;
    
    document.getElementById('detectionImage').innerHTML = `
        <div style="text-align: center;">
            <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>检测结果将显示在这里</p>
        </div>
    `;
    
    // 重置切片显示
    this.generateSlices();
}

loadTemplate() {
    // 模拟加载模板数据
    document.getElementById('patientId').value = 'TEMPLATE001';
    document.getElementById('patientName').value = '模板患者';
    document.getElementById('patientGender').value = 'male';
    document.getElementById('patientAge').value = '45';
    document.getElementById('patientSymptoms').value = '常规筛查';
    this.showNotification('已加载诊断模板');
}
}

// 初始化应用
const app = new LDCTAIDApp();