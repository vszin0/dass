document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const urlParams = new URLSearchParams(window.location.search);
    const imgSrc = urlParams.get('img');
    const imgTitle = urlParams.get('title') || 'Conference Poster';
    const imgName = urlParams.get('name') || 'DASS_Conference_Poster.jpg';

    if (!imgSrc) {
        const container = document.getElementById('poster-detail');
        if (container) {
            container.innerHTML = '<p class=\"text-center text-red-400\">포스터 정보를 불러올 수 없습니다. <a href=\"index.html#posters\" class=\"text-blue-400 hover:underline\">목록으로 돌아가기</a></p>';
        }
        return;
    }

    const posterTitleEl = document.getElementById('poster-title');
    const posterImageEl = document.getElementById('poster-image');

    if (posterTitleEl) {
        posterTitleEl.textContent = decodeURIComponent(imgTitle);
    }
    if (posterImageEl) {
        posterImageEl.src = decodeURIComponent(imgSrc);
        posterImageEl.alt = decodeURIComponent(imgTitle);
    }
    
    document.title = `${decodeURIComponent(imgTitle)} - DASS 2025 CONFERENCE`;

    const downloadBtn = document.getElementById('download-button');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            const originalContent = downloadBtn.innerHTML;
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = `
                <svg class="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                준비 중...
            `;

            try {
                const decodedImgSrc = decodeURIComponent(imgSrc);
                const decodedImgName = decodeURIComponent(imgName);

                const response = await fetch(decodedImgSrc);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                const blob = await response.blob();
                
                const isMobileRegex = new RegExp('Mobi|Android|iPhone|iPad|iPod', 'i');
                const isMobile = isMobileRegex.test(navigator.userAgent);

                if (isMobile) {
                    const file = new File([blob], decodedImgName, { type: blob.type });
                    const shareData = { files: [file] };

                    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                        await navigator.share(shareData);
                    } else {
                        alert('브라우저에서 파일 공유/저장을 지원하지 않습니다. 이미지를 새 탭에서 열어 직접 저장해주세요.');
                        window.open(decodedImgSrc, '_blank');
                    }
                } else {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = decodedImgName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            } catch (error) {
                console.error('Download failed:', error);
                const isMobileFallbackRegex = new RegExp('Mobi|Android|iPhone|iPad|iPod', 'i');
                if (isMobileFallbackRegex.test(navigator.userAgent)) {
                    alert('다운로드에 실패했습니다. 이미지를 새 탭에서 엽니다. 이미지 위에서 길게 눌러 저장할 수 있습니다.');
                    window.open(decodeURIComponent(imgSrc), '_blank');
                } else {
                    alert('이미지를 다운로드하는 데 실패했습니다. 네트워크 연결을 확인해주세요.');
                }
            } finally {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = originalContent;
                lucide.createIcons();
            }
        });
    }
});
