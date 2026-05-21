// 自定义粒子散射特效
(function() {
  function initDisintegrate() {
    // 获取那两句诗词所在的元素
    const els = document.querySelectorAll('.site-top-left, .site-top-right');
    if (!els.length) return;

    els.forEach(el => {
      // 只有还没被拆分过才执行，避免页面切换时重复
      if (!el.dataset.splitted) {
        const text = el.innerText;
        el.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const span = document.createElement('span');
          span.innerText = char === ' ' ? '\u00A0' : char; // 保留空格
          span.style.display = 'inline-block';
          span.style.position = 'relative';
          el.appendChild(span);
        }
        el.dataset.splitted = 'true';
      }

      el.style.cursor = 'pointer';
      
      el.addEventListener('mouseenter', function() {
        if (el.dataset.disintegrating === 'true') return;
        el.dataset.disintegrating = 'true';

        const spans = el.querySelectorAll('span');
        
        // 【崩解阶段】：所有文字向四周四散并透明化
        spans.forEach(span => {
          const tx = (Math.random() - 0.5) * 120; // 横向炸开距离大幅缩小（原500 -> 120）
          const ty = (Math.random() - 0.5) * 120 - 20; // 纵向炸开距离缩小
          const rot = (Math.random() - 0.5) * 360; // 随机旋转
          const dur = 0.4 + Math.random() * 0.5; // 动画时长稍微加快配合小范围

          span.style.transition = `transform ${dur}s cubic-bezier(0.1, 0.9, 0.2, 1), opacity ${dur}s ease-out, filter ${dur}s ease-out`;
          span.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${0.7 + Math.random() * 0.5})`; // 缩放变化减弱
          span.style.opacity = '0';
          span.style.filter = 'blur(0.5px)'; // 去除原本 5px 的重度模糊，变为极轻微运动模糊，保持字符清晰
        });

        // 【重组阶段】：时光倒流回到原地
        setTimeout(() => {
          spans.forEach(span => {
            span.style.transition = `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-in, filter 0.6s ease-in`;
            span.style.transform = 'translate(0px, 0px) rotate(0deg) scale(1)';
            span.style.opacity = '1';
            span.style.filter = 'blur(0px)';
          });

          // 动画结束后解除状态锁定，允许再次触发
          setTimeout(() => {
            el.dataset.disintegrating = 'false';
          }, 600);
        }, 1100); // 崩解炸开后，等待 1.1 秒开始飞回
      });
    });
  }

  // 页面初次加载时执行
  document.addEventListener('DOMContentLoaded', initDisintegrate);
  // 适配 Butterfly 主题的 Pjax 页面无刷新切换
  if (window.btf && typeof window.btf.addGlobalFn === 'function') {
    window.btf.addGlobalFn('pjaxComplete', initDisintegrate);
  }
})();