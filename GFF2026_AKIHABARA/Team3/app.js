document.addEventListener('DOMContentLoaded', () => {
    const btnProposal = document.getElementById('btn-proposal');
    const btnVideo = document.getElementById('btn-video');
    const btnClose = document.getElementById('btn-close');
    const modalOverlay = document.getElementById('modal-overlay');
    const proposalView = document.getElementById('proposal-view');
    const videoView = document.getElementById('video-view');
    const largeVideo = document.getElementById('large-video');
    const bgVideo = document.getElementById('bg-video');

    function openModal(type) {
        modalOverlay.classList.remove('hidden');
        if (type === 'proposal') {
            proposalView.classList.remove('hidden');
            videoView.classList.add('hidden');
        } else {
            videoView.classList.remove('hidden');
            proposalView.classList.add('hidden');
            largeVideo.play();
            bgVideo.pause();
        }
    }

    function closeModal() {
        modalOverlay.classList.add('hidden');
        proposalView.classList.add('hidden');
        videoView.classList.add('hidden');
        largeVideo.pause();
        bgVideo.play();
    }

    btnProposal?.addEventListener('click', () => openModal('proposal'));
    btnVideo?.addEventListener('click', () => openModal('video'));
    btnClose?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
});
