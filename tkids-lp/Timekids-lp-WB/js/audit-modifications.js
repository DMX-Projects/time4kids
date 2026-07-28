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

    function getEnquiryTarget() {
        return (
            document.querySelector('#banner .form_hld.tk-enquiry-card') ||
            document.getElementById('timekidsEnquiryForm') ||
            document.getElementById('timekidsForm')
        );
    }

    /**
     * Book A Call: always bring the page to the top hero —
     * T.I.M.E. Kids logo (header) + Enquire Now form in the same view.
     * Do NOT scroll the form flush to the top (that hides the logo).
     */
    function scrollToEnquiryForm(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Clear hash so the browser does not re-jump to #timekidsForm
        if (window.history && window.history.replaceState) {
            try {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
            } catch (err) {}
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Soft-highlight the form without scrolling it into isolation
        var form = getEnquiryTarget();
        if (form) {
            form.classList.add('tk-enquiry-flash');
            window.setTimeout(function () {
                form.classList.remove('tk-enquiry-flash');
            }, 1200);
        }
    }

    function initFloatingCta() {
        if (document.querySelector('.tk-float-cta')) return;
        var form = getEnquiryTarget();
        var a = document.createElement('a');
        a.className = 'tk-float-cta';
        a.href = '#timekidsForm';
        a.setAttribute('aria-label', 'Book a call');
        a.textContent = 'Book A Call';
        a.addEventListener('click', scrollToEnquiryForm);
        document.body.appendChild(a);

        function syncVisibility() {
            if (!form) return;
            // Hide float CTA when user is already at the top hero (logo + form)
            var atTop = (window.pageYOffset || document.documentElement.scrollTop) < 80;
            var rect = form.getBoundingClientRect();
            var formInHero = rect.top < window.innerHeight * 0.85 && rect.bottom > 60;
            a.classList.toggle('is-hidden', atTop || formInHero);
        }
        window.addEventListener('scroll', syncVisibility, { passive: true });
        window.addEventListener('resize', syncVisibility);
        syncVisibility();
    }

    function initBookCallLinks() {
        document.querySelectorAll('a[href="#timekidsForm"], a[href="#timekidsEnquiryForm"]').forEach(function (link) {
            link.addEventListener('click', scrollToEnquiryForm);
        });
    }

    $(document).ready(function () {
        initInvestmentChips();
        initFloatingCta();
        initBookCallLinks();
    });
})();
