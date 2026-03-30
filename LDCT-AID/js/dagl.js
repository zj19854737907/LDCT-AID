// 医生信息
  const doctorInfo = {
    name: "张医生",
    title: "主任医师",
    avatar: "张"
  };

  // 初始化患者数据存储
  function initializePatientStorage() {
    // 检查本地存储中是否已有患者数据
    if (!localStorage.getItem('patients')) {
      // 如果没有，则初始化示例数据
      const samplePatients = [
        {
          id: 'P002311',
          name: '王晨亮',
          age: 45,
          gender: 'male',
          condition: '肺部微小结节，定期复查',
          date: '2023-10-15',
          status: 'completed',
          images: {
            lowDose: 'https://via.placeholder.com/800x600/0066FF/ffffff?text=低剂量CT',
            denoised: 'https://via.placeholder.com/800x600/0066FF/ffffff?text=降噪后CT',
            processed: 'https://via.placeholder.com/800x600/7736FF/ffffff?text=异常处理后CT'
          },
          aiDiagnosis: 'AI分析完成：检测到肺部微小结节，建议进一步观察。图像质量评估：良好。',
          doctorDiagnosis: '患者肺部发现微小结节，直径约5mm，边界清晰。建议6个月后复查CT，观察结节变化。'
        },
        {
          id: 'P002312',
          name: '惠天琪',
          age: 62,
          gender: 'female',
          condition: '疑似早期肺癌，建议活检',
          date: '2023-10-10',
          status: 'pending',
          images: {
            lowDose: 'https://via.placeholder.com/800x600/0066FF/ffffff?text=低剂量CT',
            denoised: 'https://via.placeholder.com/800x600/0066FF/ffffff?text=降噪后CT',
            processed: 'https://via.placeholder.com/800x600/7736FF/ffffff?text=异常处理后CT'
          },
          aiDiagnosis: 'AI分析完成：右肺上叶发现可疑结节，直径约12mm，边缘不规则，建议活检确认。',
          doctorDiagnosis: '结合AI分析，患者右肺上叶结节高度可疑，已安排CT引导下穿刺活检。'
        }
      ];
      localStorage.setItem('patients', JSON.stringify(samplePatients));
    }
  }

  // 获取所有患者数据
  function getAllPatients() {
    return JSON.parse(localStorage.getItem('patients')) || [];
  }

  // 保存患者数据
  function savePatient(patient) {
    const patients = getAllPatients();
    // 检查是否已存在相同ID的患者
    const existingIndex = patients.findIndex(p => p.id === patient.id);
    if (existingIndex !== -1) {
      // 更新现有患者
      patients[existingIndex] = patient;
    } else {
      // 添加新患者
      patients.push(patient);
    }
    localStorage.setItem('patients', JSON.stringify(patients));
  }

  // 初始化存储
  initializePatientStorage();

  // 选项卡切换功能
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // 移除所有标签和内容的active类
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      // 为当前标签和对应内容添加active类
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');

      // 如果切换到搜索标签，刷新患者列表
      if (tabId === 'search-reports') {
        displaySearchResults(getAllPatients());
      }
    });
  });

  // 性别选择器功能
  const genderSelector = document.getElementById('gender-selector');
  const genderDisplay = document.getElementById('gender-display-text');
  const genderInput = document.getElementById('patient-gender');
  const genderOptions = document.querySelectorAll('.gender-option');

  // 点击性别选择器
  genderSelector.addEventListener('click', function(e) {
    e.stopPropagation();
    this.classList.toggle('active');
  });

  // 选择性别选项
  genderOptions.forEach(option => {
    option.addEventListener('click', function() {
      const value = this.getAttribute('data-value');
      const text = this.textContent;

      // 更新显示文本
      genderDisplay.textContent = text;

      // 更新隐藏输入框的值
      genderInput.value = value;

      // 更新选中状态
      genderOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');

      // 关闭下拉菜单
      genderSelector.classList.remove('active');
    });
  });

  // 点击页面其他地方关闭下拉菜单
  document.addEventListener('click', function() {
    genderSelector.classList.remove('active');
  });

  // 图像弹窗功能
  const imageModal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const closeModal = document.getElementById('close-modal');
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const resetZoomBtn = document.getElementById('reset-zoom');
  const zoomLevel = document.getElementById('zoom-level');
  const prevImageBtn = document.getElementById('prev-image');
  const nextImageBtn = document.getElementById('next-image');

  let currentScale = 1;
  const minScale = 0.1;
  const maxScale = 5;
  const scaleStep = 0.1;

  // 关闭弹窗
  closeModal.addEventListener('click', function() {
    imageModal.classList.remove('active');
    resetZoom();
  });

  // 点击弹窗外部关闭
  imageModal.addEventListener('click', function(e) {
    if (e.target === imageModal) {
      imageModal.classList.remove('active');
      resetZoom();
    }
  });

  // 按ESC键关闭弹窗
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && imageModal.classList.contains('active')) {
      imageModal.classList.remove('active');
      resetZoom();
    }
  });

  // 缩放功能
  function updateZoom() {
    modalImage.style.transform = `scale(${currentScale})`;
    zoomLevel.textContent = `${Math.round(currentScale * 100)}%`;
  }

  function zoomIn() {
    if (currentScale < maxScale) {
      currentScale += scaleStep;
      updateZoom();
    }
  }

  function zoomOut() {
    if (currentScale > minScale) {
      currentScale -= scaleStep;
      updateZoom();
    }
  }

  function resetZoom() {
    currentScale = 1;
    updateZoom();
  }

  zoomInBtn.addEventListener('click', zoomIn);
  zoomOutBtn.addEventListener('click', zoomOut);
  resetZoomBtn.addEventListener('click', resetZoom);

  // 图像上传预览功能
  const lowDoseInput = document.getElementById('low-dose-ct');
  const denoisedInput = document.getElementById('denoised-ct');
  const processedInput = document.getElementById('processed-ct');

  const lowDosePreview = document.getElementById('low-dose-preview');
  const denoisedPreview = document.getElementById('denoised-preview');
  const processedPreview = document.getElementById('processed-preview');

  // 存储上传的图像
  const uploadedImages = {
    lowDose: null,
    denoised: null,
    processed: null
  };

  function handleImageUpload(input, previewElement, type) {
    input.addEventListener('change', function(e) {
      if (this.files && this.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
          previewElement.innerHTML = `<img src="${e.target.result}" alt="${type} CT图像">`;
          uploadedImages[type] = e.target.result;

          // 显示通知
          showNotification('图像上传成功', 'success');
        }

        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  handleImageUpload(lowDoseInput, lowDosePreview, 'lowDose');
  handleImageUpload(denoisedInput, denoisedPreview, 'denoised');
  handleImageUpload(processedInput, processedPreview, 'processed');

  // 图像预览弹窗
  const imagePreviews = document.querySelectorAll('.image-preview');

  imagePreviews.forEach(preview => {
    preview.addEventListener('click', function() {
      const type = this.getAttribute('data-type');
      let imageSrc = null;
      let title = '';

      switch(type) {
        case 'low-dose':
          imageSrc = uploadedImages.lowDose || document.querySelector('#low-dose-preview img')?.src;
          title = '低剂量CT图像';
          break;
        case 'denoised':
          imageSrc = uploadedImages.denoised || document.querySelector('#denoised-preview img')?.src;
          title = '降噪后CT图像';
          break;
        case 'processed':
          imageSrc = uploadedImages.processed || document.querySelector('#processed-preview img')?.src;
          title = '异常处理后CT图像';
          break;
      }

      if (imageSrc && imageSrc !== 'none') {
        modalImage.src = imageSrc;
        modalTitle.textContent = title;
        imageModal.classList.add('active');
      }
    });
  });

  // 显示通知
  function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type);
    notification.classList.add('show');

    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  // AI聊天功能
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const aiChat = document.getElementById('ai-chat');
  const analyzeImagesBtn = document.getElementById('analyze-images-btn');
  const aiSummaryContent = document.getElementById('ai-summary-content');

  function addChatMessage(text, isDoctor = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isDoctor ? 'doctor' : 'ai'}`;

    const sender = isDoctor ? doctorInfo.name : 'DeepSeek AI';
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;

    aiChat.appendChild(messageDiv);
    aiChat.scrollTop = aiChat.scrollHeight;
  }

  // chatSendBtn.addEventListener('click', function() {
  //   const message = chatInput.value.trim();
  //   if (message) {
  //     addChatMessage(message, true);
  //     chatInput.value = '';

  //     // 模拟AI回复
  //     setTimeout(() => {
  //       const replies = [
  //         "感谢您的提问。根据您提供的信息，我建议进一步观察患者的肺部变化。",
  //         "您的问题很专业。从现有数据来看，患者的情况需要结合更多临床信息进行综合判断。",
  //         "我理解您的关注点。关于这个问题，最新的研究表明定期随访是比较稳妥的方案。",
  //         "您提到的情况值得关注。建议结合患者的病史和其他检查结果进行分析。"
  //       ];

  //       const randomReply = replies[Math.floor(Math.random() * replies.length)];
  //       addChatMessage(randomReply);
  //     }, 1000);
  //   }
  // });

  // 按Enter键发送消息
  // chatInput.addEventListener('keypress', function(e) {
  //   if (e.key === 'Enter') {
  //     chatSendBtn.click();
  //   }
  // });

  // AI分析图像功能
  // analyzeImagesBtn.addEventListener('click', function() {
  //   // 检查是否上传了图像
  //   if (!uploadedImages.lowDose && !uploadedImages.denoised && !uploadedImages.processed) {
  //     showNotification('请至少上传一张CT图像', 'error');
  //     return;
  //   }

  //   // 显示加载状态
  //   this.innerHTML = '<span class="loading"></span> 分析中...';
  //   this.disabled = true;

  //   // 模拟AI分析过程
  //   setTimeout(() => {
  //     // 恢复按钮状态
  //     this.innerHTML = '<i class="fas fa-brain"></i> AI分析CT图像';
  //     this.disabled = false;

  //     // 生成分析结果
  //     const analysisResults = [
  //       "AI分析完成：左肺下叶可见一直径约6mm结节，边界清晰，密度均匀，考虑为良性结节可能性大。建议6个月后复查。",
  //       "AI分析完成：右肺上叶发现磨玻璃影，范围约12×8mm，建议抗炎治疗后复查，密切随访。",
  //       "AI分析完成：双肺散在微小结节，最大直径3mm，考虑为炎性结节，建议年度复查。",
  //       "AI分析完成：未见明显异常结节影，肺野清晰，纵隔结构正常。"
  //     ];

  //     const randomResult = analysisResults[Math.floor(Math.random() * analysisResults.length)];

  //     // 添加到聊天记录
  //     addChatMessage(randomResult);

  //     // 更新总结区域
  //     aiSummaryContent.textContent = randomResult;

  //     showNotification('AI分析完成', 'success');
  //   }, 3000);
  // });

  // 表单提交功能
  const reportForm = document.getElementById('report-form');
  const resetBtn = document.getElementById('reset-btn');

  reportForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // 获取表单数据
    const patientData = {
      id: document.getElementById('patient-id').value,
      name: document.getElementById('patient-name').value,
      age: document.getElementById('patient-age').value,
      gender: document.getElementById('patient-gender').value,
      condition: document.getElementById('patient-condition').value,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      images: {
        lowDose: uploadedImages.lowDose || null,
        denoised: uploadedImages.denoised || null,
        processed: uploadedImages.processed || null
      },
      
      doctorDiagnosis: document.getElementById('doctor-diagnosis').value
    };

    // 保存患者数据
    savePatient(patientData);

    // 显示成功通知
    showNotification('报告提交成功', 'success');

    // 自动切换到搜索标签并刷新患者列表
    document.querySelector('[data-tab="search-reports"]').click();
    displaySearchResults(getAllPatients());

    // 重置表单
    reportForm.reset();
    lowDosePreview.textContent = '暂无图像';
    denoisedPreview.textContent = '暂无图像';
    processedPreview.textContent = '暂无图像';
    aiSummaryContent.textContent = '等待AI分析结果...';
    genderDisplay.textContent = '选择性别';
    genderOptions.forEach(opt => opt.classList.remove('selected'));

    // 清空上传的图像
    Object.keys(uploadedImages).forEach(key => {
      uploadedImages[key] = null;
    });

    // 清空聊天记录（保留初始消息）
    while (aiChat.children.length > 1) {
      aiChat.removeChild(aiChat.lastChild);
    }
  });

  // 重置按钮功能
  resetBtn.addEventListener('click', function() {
    if (confirm('确定要重置表单吗？所有已输入的数据将被清空。')) {
      reportForm.reset();
      lowDosePreview.textContent = '暂无图像';
      denoisedPreview.textContent = '暂无图像';
      processedPreview.textContent = '暂无图像';
      aiSummaryContent.textContent = '等待AI分析结果...';
      genderDisplay.textContent = '选择性别';
      genderOptions.forEach(opt => opt.classList.remove('selected'));

      // 清空上传的图像
      Object.keys(uploadedImages).forEach(key => {
        uploadedImages[key] = null;
      });

      // 清空聊天记录（保留初始消息）
      while (aiChat.children.length > 1) {
        aiChat.removeChild(aiChat.lastChild);
      }
    }
  });

  // 搜索功能
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const patientList = document.getElementById('patient-list');
  const reportDetails = document.getElementById('report-details');

  function displaySearchResults(patients) {
    patientList.innerHTML = '';

    if (patients.length === 0) {
      patientList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-light);">未找到匹配的患者记录</div>';
      return;
    }

    patients.forEach(patient => {
      const patientItem = document.createElement('div');
      patientItem.className = 'patient-item';

      const genderText = patient.gender === 'male' ? '男' : patient.gender === 'female' ? '女' : '其他';

      let statusText = '';
      let statusClass = '';

      switch(patient.status) {
        case 'completed':
          statusText = '已完成';
          statusClass = 'status-completed';
          break;
        case 'pending':
          statusText = '待处理';
          statusClass = 'status-pending';
          break;
        case 'uploaded':
          statusText = '已上传';
          statusClass = 'status-uploaded';
          break;
      }

      patientItem.innerHTML = `
        <div class="patient-info">
          <h3>${patient.name} (${patient.id})</h3>
          <p>${patient.age}岁 · ${genderText} · 检查日期: ${patient.date} · <span class="status-badge ${statusClass}">${statusText}</span></p>
        </div>
        <button class="view-btn" data-id="${patient.id}">查看报告</button>
      `;

      patientList.appendChild(patientItem);
    });

    // 添加查看报告事件
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const patientId = this.getAttribute('data-id');
        viewPatientReport(patientId);
      });
    });
  }

  function viewPatientReport(patientId) {
    const patients = getAllPatients();
    const patient = patients.find(p => p.id === patientId);

    if (patient) {
      const genderText = patient.gender === 'male' ? '男' : patient.gender === 'female' ? '女' : '其他';

      let statusText = '';
      let statusClass = '';

      switch(patient.status) {
        case 'completed':
          statusText = '已完成';
          statusClass = 'status-completed';
          break;
        case 'pending':
          statusText = '待处理';
          statusClass = 'status-pending';
          break;
        case 'uploaded':
          statusText = '已上传';
          statusClass = 'status-uploaded';
          break;
      }

      // 构建报告详情HTML
      let imagesHtml = '';

      if (patient.images.lowDose || patient.images.denoised || patient.images.processed) {
        imagesHtml = '<div class="report-images">';

        if (patient.images.lowDose) {
          imagesHtml += `
            <div class="report-image">
              <h4>低剂量CT</h4>
              <img src="${patient.images.lowDose}" alt="低剂量CT图像" class="report-img" data-type="low-dose">
            </div>
          `;
        }

        if (patient.images.denoised) {
          imagesHtml += `
            <div class="report-image">
              <h4>降噪后CT</h4>
              <img src="${patient.images.denoised}" alt="降噪后CT图像" class="report-img" data-type="denoised">
            </div>
          `;
        }

        if (patient.images.processed) {
          imagesHtml += `
            <div class="report-image">
              <h4>异常处理后CT</h4>
              <img src="${patient.images.processed}" alt="异常处理后CT图像" class="report-img" data-type="processed">
            </div>
          `;
        }

        imagesHtml += '</div>';
      }

      reportDetails.innerHTML = `
        <div class="report-header">
          <div>
            <h2>${patient.name} 的诊断报告 (${patient.id})</h2>
            <p>检查日期: ${patient.date} · <span class="status-badge ${statusClass}">${statusText}</span></p>
          </div>
          <button class="btn btn-secondary" id="close-report">关闭报告</button>
        </div>

        ${imagesHtml}

        <div class="report-content">
          <div class="report-section">
            <h3>患者基本信息</h3>
            <p><strong>年龄:</strong> ${patient.age}岁</p>
            <p><strong>性别:</strong> ${genderText}</p>
            <p><strong>病症描述:</strong> ${patient.condition}</p>
          </div>

          <div class="report-section">
            <h3>AI诊断结果</h3>
            <p>${patient.aiDiagnosis}</p>
          </div>

          <div class="report-section">
            <h3>医生诊断意见</h3>
            <p>${patient.doctorDiagnosis}</p>
          </div>
        </div>
      `;

      // 显示报告详情
      reportDetails.style.display = 'block';
      reportDetails.scrollIntoView({ behavior: 'smooth' });

      // 添加关闭报告事件
      document.getElementById('close-report').addEventListener('click', function() {
        reportDetails.style.display = 'none';
      });

      // 添加报告中图像的预览功能
      document.querySelectorAll('.report-img').forEach(img => {
        img.addEventListener('click', function() {
          const type = this.getAttribute('data-type');
          let title = '';

          switch(type) {
            case 'low-dose':
              title = '低剂量CT图像';
              break;
            case 'denoised':
              title = '降噪后CT图像';
              break;
            case 'processed':
              title = '异常处理后CT图像';
              break;
          }

          modalImage.src = this.src;
          modalTitle.textContent = title;
          imageModal.classList.add('active');
        });
      });
    }
  }

  searchBtn.addEventListener('click', function() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const patients = getAllPatients();

    if (searchTerm) {
      const filteredPatients = patients.filter(patient =>
              patient.name.toLowerCase().includes(searchTerm) ||
              patient.id.toLowerCase().includes(searchTerm)
      );

      displaySearchResults(filteredPatients);
    } else {
      displaySearchResults(patients);
    }
  });

  // 按Enter键搜索
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  // 初始显示所有患者
  displaySearchResults(getAllPatients());