angular.module('docs')
  .controller('ImageEdit', function ($scope, $stateParams, $timeout) {
    console.log('Cropper', window.Cropper);
    console.log('[ImageEdit] registered to module docs');

    $scope.log = console.log;
    $scope.fileId = $stateParams.fileId;
    $scope.fileName = $stateParams.fileName || 'edited.png';
    $scope.cropperReady = false;

    let currentDeg = 0;
    let cropper = null;
    let inited = false;
    let drawMode = false;
    let rotationPending = false;
    let cropMode = false;
    let strokes = [];
    let currentStroke = null;

    // 初始化 Cropper
    const initCropper = () => {
      const img = document.getElementById('editor-img');

      const init = () => {
        if (inited) return;

        const overlay = document.getElementById('draw-layer');
        if (!overlay) {
          return $timeout(init, 0);
        }

        inited = true;

        // 调整画布尺寸与图片一致
        overlay.width = img.naturalWidth;
        overlay.height = img.naturalHeight;
        overlay.style.width = img.offsetWidth + 'px';
        overlay.style.height = img.offsetHeight + 'px';

        // Cropper
        cropper = new Cropper(img, {
          viewMode: 1,
          dragMode: 'none',
          autoCrop: false,
          autoCropArea: 1,
          ready() {
            console.log('[Cropper] ready (before $timeout)');
            $timeout(() => {
              fitOverlayToCanvas();
              $scope.cropperReady = true;
              console.log('[Cropper] ready (inside $timeout) $scope.cropperReady =', $scope.cropperReady);
            });
          }
        });

        // 绑定画笔事件，默认关闭
        setupDrawing(overlay);
        overlay.style.pointerEvents = 'none';
      };

      img.complete ? init() : img.addEventListener('load', init, { once: true });
    };

    $timeout(initCropper, 0);

    // 进入剪裁模式
    $scope.enterCropMode = () => {
      if (drawMode) return alert('请先保存涂鸦');
      cropMode = true;
      rotationPending = false;

      cropper.clear();
      cropper.setDragMode('crop');

      alert('已进入剪裁/旋转模式，完成后请点击“保存剪裁”');
    };

    // 旋转
    $scope.rotate = (delta) => {
      if (drawMode) return alert('请先保存涂鸦');
      if (!cropMode) return alert('请先进入剪裁模式！');
      if (!cropper || !cropMode) return;

      currentDeg = ((currentDeg + delta) % 360 + 360) % 360;
      cropper.rotate(delta);
      rotationPending = true;

      fitOverlayToCanvas();

      const container = document.getElementById('editor-container');
      container.style.flexDirection = (currentDeg === 90 || currentDeg === 270) ? 'column' : 'row';

      console.log('rotate →', delta, 'deg │ 总角度 =', currentDeg);
    };

    // 确认剪裁
    $scope.confirmCrop = () => {
      if (drawMode) return alert('请先保存涂鸦');
      if (!cropMode || !cropper) return alert('未开启剪裁模式！');

      cropper.crop();

      const canvas = cropper.getCroppedCanvas({
        fillColor: '#fff'
      });

      if (!canvas) {
        alert('裁剪失败，请检查是否选中区域');
        return;
      }

      cropper.replace(canvas.toDataURL('image/png'));
      $timeout(() => fitOverlayToCanvas(), 0);

      cropMode = false;
      rotationPending = false;
      alert('剪裁完成，可以继续编辑');
    };

    // 适配画布覆盖层
    const fitOverlayToCanvas = () => {
      if (!cropper) return;

      const cd = cropper.getCanvasData();
      const overlay = document.getElementById('draw-layer');
      overlay.width = cd.width;
      overlay.height = cd.height;
      overlay.style.left = cd.left + 'px';
      overlay.style.top = cd.top + 'px';
      overlay.style.width = cd.width + 'px';
      overlay.style.height = cd.height + 'px';

      setupDrawing(overlay);
      const ctx = overlay.getContext('2d');
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      strokes = [];
      currentStroke = null;
    };

    // 设置绘图事件
    const setupDrawing = (canvas) => {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#ff0000';
      const pixelWidth = 3;

      canvas.addEventListener('mousedown', (e) => {
        if (!drawMode) return;
        const x = e.offsetX;
        const y = e.offsetY;
        currentStroke = [[x, y]];
      });

      canvas.addEventListener('mousemove', (e) => {
        if (!drawMode || !currentStroke) return;
        const x = e.offsetX;
        const y = e.offsetY;

        currentStroke.push([x, y]);
        redrawAll(ctx);
      });

      window.addEventListener('mouseup', () => {
        if (currentStroke && drawMode) {
          strokes.push(currentStroke);
          currentStroke = null;
        }
      });
    };

    // 重绘所有笔触
    const redrawAll = (ctx) => {
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ff0000';

      const overlay = ctx.canvas;
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      const scaleX = overlay.width / overlay.getBoundingClientRect().width;
      const scaleY = overlay.height / overlay.getBoundingClientRect().height;

      ctx.save();
      ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);

      const drawStroke = (pts) => {
        if (pts.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(...pts[0]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(...pts[i]);
        }
        ctx.stroke();
      };

      strokes.forEach(drawStroke);
      if (currentStroke) drawStroke(currentStroke);

      ctx.restore();
    };

    // 切换画笔模式
    $scope.toggleDraw = () => {
      if (cropMode) return alert('请先保存剪裁再进行操作');

      const overlay = document.getElementById('draw-layer');
      drawMode = !drawMode;
      overlay.style.pointerEvents = drawMode ? 'auto' : 'none';
      overlay.style.cursor = drawMode ? 'crosshair' : 'default';
    };

    // 撤销最后一笔
    $scope.undoDraw = () => {
      if (cropMode) return alert('请先保存剪裁再进行操作');
      if (!strokes.length) {
        alert('当前没有涂鸦内容可撤销');
        return;
      }

      strokes.pop();
      const ctx = document.getElementById('draw-layer').getContext('2d');
      redrawAll(ctx);
    };

    // 保存涂鸦
    $scope.saveDraw = () => {
      if (cropMode) return alert('请先保存剪裁再进行操作');

      if (!strokes.length) {
        alert('当前没有涂鸦内容可保存');
        return;
      }

      const overlay = document.getElementById('draw-layer');
      const ctxOL = overlay.getContext('2d');
      redrawAll(ctxOL);

      const imgInfo = cropper.getImageData();
      const tmp = document.createElement('canvas');
      tmp.width = imgInfo.naturalWidth;
      tmp.height = imgInfo.naturalHeight;
      const tctx = tmp.getContext('2d');

      const fullCanvas = cropper.getCroppedCanvas({
        width: tmp.width,
        height: tmp.height,
        fillColor: '#fff'
      });

      tctx.drawImage(fullCanvas, 0, 0);

      const scale = tmp.width / overlay.width;
      tctx.strokeStyle = '#ff0000';
      tctx.lineWidth = 3 * scale;

      const drawStroke = (pts) => {
        if (pts.length < 2) return;
        tctx.beginPath();
        tctx.moveTo(pts[0][0] * scale, pts[0][1] * scale);
        for (let i = 1; i < pts.length; i++) {
          tctx.lineTo(pts[i][0] * scale, pts[i][1] * scale);
        }
        tctx.stroke();
      };
      strokes.forEach(drawStroke);

      cropper.replace(tmp.toDataURL('image/png'));

      strokes = [];
      const overlayCtx = overlay.getContext('2d');
      overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

      drawMode = false;
      overlay.style.pointerEvents = 'none';
      overlay.style.cursor = 'default';

      alert('涂鸦已保存至图片');
    };

    // 保存并上传
    $scope.cropAndUpload = () => {
      if (cropMode) return alert('请先保存剪裁再进行操作');

      console.log('[DEBUG] cropper =', cropper);
      console.log('[DEBUG] $scope.cropperReady =', $scope.cropperReady);
      console.log('[ImageEdit] scope ID =', $scope.$id);
      if (!cropper || !$scope.cropperReady || typeof cropper.getData !== 'function') {
        console.log('[DEBUG] cropper =', cropper);
        alert('图片还在加载或裁剪器未准备好，请稍后重试');
        return;
      }

      console.log('[ImageEdit] instantiated, fileId =', $stateParams.fileId);

      if (!cropper.isCropped) cropper.crop();

      const data = cropper.getData();
      if (!data.width || !data.height) {
        alert('请先拖动裁剪框，选择裁剪区域');
        return;
      }

      cropper.crop();
      const canvas = cropper.getCroppedCanvas({ fillColor: '#fff' });
      if (!canvas) {
        alert('裁剪区域为空，无法保存');
        return;
      }
      canvas.toBlob((blob) => {
        const fd = new FormData();
        fd.append('file', blob, $scope.fileName);
        fd.append('previousFileId', $scope.fileId);

        fetch('../api/file', { method: 'PUT', body: fd, credentials: 'include' })
          .then(response => response.json())
          .then(() => {
            alert('已保存');
            window.close();
          })
          .catch(() => {
            alert('上传失败');
          });
      }, 'image/png');
    };
  });