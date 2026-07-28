(function () {
    function initInvestmentChips() {
        var $form = $('#timekidsEnquiryForm');
        if (!$form.length) return;

        var $hidden = $form.find('#tk-investment-range');
        $form.on('click', '.tk-chip', function () {
            var $chip = $(this);
            $form.find('.tk-chip').removeClass('is-active');
            $chip.addClass('is-active');
            $hidden.val($chip.data('value') || '');
            if ($form.data('validator')) {
                $form.validate().element($hidden[0]);
            }
        });
    }

    function initFloatingCta() {
        if (document.querySelector('.tk-float-cta')) return;
        var form = document.getElementById('timekidsForm') || document.getElementById('timekidsEnquiryForm');
        var a = document.createElement('a');
        a.className = 'tk-float-cta';
        a.href = '#timekidsForm';
        a.setAttribute('aria-label', 'Book a call');
        a.textContent = 'Book A Call';
        document.body.appendChild(a);

        function syncVisibility() {
            if (!form) return;
            var rect = form.getBoundingClientRect();
            var inView = rect.top < window.innerHeight * 0.7 && rect.bottom > 80;
            a.classList.toggle('is-hidden', inView);
        }
        window.addEventListener('scroll', syncVisibility, { passive: true });
        window.addEventListener('resize', syncVisibility);
        syncVisibility();
    }

    $(document).ready(function () {
        initInvestmentChips();
        initFloatingCta();
    });
})();
