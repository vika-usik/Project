document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(function(button) {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    const refreshButton = document.querySelector('a[href*="refresh"]');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            const icon = this.querySelector('.fa-sync-alt');
            if (icon) {
                icon.classList.add('fa-spin');
            }
        });
    }
    const quoteForm = document.querySelector('form[action*="add_quote"]');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            const quoteText = this.querySelector('textarea[name="quote_text"]');
            if (quoteText && quoteText.value.trim().length < 10) {
                e.preventDefault();
                alert(document.documentElement.lang === 'uk' ? 
                      'Цитата повинна містити принаймні 10 символів' : 
                      'Quote must be at least 10 characters long');
                quoteText.focus();
            }
        });
    }
    const usernameForm = document.querySelector('form[action*="set_username"]');
    if (usernameForm) {
        const usernameInput = usernameForm.querySelector('input[name="username"]');
        if (usernameInput) {
            usernameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.form.submit();
                }
            });
        }
    }
    const searchForm = document.querySelector('form[action*="index"]');
    if (searchForm) {
        const searchInput = searchForm.querySelector('input[name="search"]');
        if (searchInput) {
            // Clear search when category changes
            const categorySelect = searchForm.querySelector('select[name="category"]');
            if (categorySelect) {
                categorySelect.addEventListener('change', function() {
                    if (searchInput.value.trim() === '') {
                        searchForm.submit();
                    }
                });
            }
        }
    }
    const removeFavoriteButtons = document.querySelectorAll('form[action*="remove_favorite"] button[type="submit"]');
    removeFavoriteButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            const isUkrainian = document.documentElement.lang === 'uk';
            const confirmMessage = isUkrainian ? 
                'Ви впевнені, що хочете видалити цю цитату з улюблених?' : 
                'Are you sure you want to remove this quote from favorites?';
            if (!confirm(confirmMessage)) {
                e.preventDefault();
            }
        });
    });
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + R for refresh (prevent default and use our refresh)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            const refreshLink = document.querySelector('a[href*="refresh"]');
            if (refreshLink) {
                window.location.href = refreshLink.href;
            }
        }
        if (e.key === 'Escape') {
            const searchInput = document.querySelector('input[name="search"]');
            if (searchInput && searchInput.value.trim() !== '') {
                searchInput.value = '';
                searchInput.form.submit();
            }
        }
    });
});
function shareQuote(text, author) {
    const shareText = `"${text}" - ${author}`;
    const shareUrl = window.location.origin;
    if (navigator.share) {
        navigator.share({
            title: document.documentElement.lang === 'uk' ? 'Цитата дня' : 'Quote of the Day',
            text: shareText,
            url: shareUrl
        }).catch(function(error) {
            console.log('Error sharing:', error);
            fallbackShare(shareText, shareUrl);
        });
    } else {
        fallbackShare(shareText, shareUrl);
    }
}
function fallbackShare(text, url) {
    if (navigator.clipboard) {
        const shareString = `${text}\n\n${url}`;
        navigator.clipboard.writeText(shareString).then(function() {
            showToast(document.documentElement.lang === 'uk' ? 
                     'Цитату скопійовано в буфер обміну!' : 
                     'Quote copied to clipboard!');
        }).catch(function(error) {
            console.log('Error copying to clipboard:', error);
            showShareModal(text, url);
        });
    } else {
        showShareModal(text, url);
    }
}
function showShareModal(text, url) {
    const isUkrainian = document.documentElement.lang === 'uk';
    const shareString = `${text}\n\n${url}`;
    const modalHtml = `
        <div class="modal fade" id="shareModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-share me-2"></i>
                            ${isUkrainian ? 'Поділитися цитатою' : 'Share Quote'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>${isUkrainian ? 'Скопіюйте текст нижче:' : 'Copy the text below:'}</p>
                        <textarea class="form-control" rows="4" readonly>${shareString}</textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            ${isUkrainian ? 'Закрити' : 'Close'}
                        </button>
                        <button type="button" class="btn btn-primary" onclick="copyFromModal()">
                            <i class="fas fa-copy me-1"></i>
                            ${isUkrainian ? 'Копіювати' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('shareModal'));
    modal.show();
    document.getElementById('shareModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}
function copyFromModal() {
    const textarea = document.querySelector('#shareModal textarea');
    textarea.select();
    document.execCommand('copy');
    const isUkrainian = document.documentElement.lang === 'uk';
    showToast(isUkrainian ? 'Скопійовано!' : 'Copied!');
    bootstrap.Modal.getInstance(document.getElementById('shareModal')).hide();
}
function showToast(message) {
    // Create toast
    const toastHtml = `
        <div class="toast-container position-fixed bottom-0 end-0 p-3">
            <div class="toast" role="alert">
                <div class="toast-header">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    <strong class="me-auto">${document.documentElement.lang === 'uk' ? 'Готово' : 'Success'}</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.querySelector('.toast-container .toast');
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    toastElement.addEventListener('hidden.bs.toast', function() {
        this.parentElement.remove();
    });
}
function initThemeToggle() {
    const themeToggle = document.querySelector('a[href*="toggle_theme"]');
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const icon = this.querySelector('.fas');
            const originalClass = icon.className;
            icon.className = 'fas fa-spinner fa-spin';
            setTimeout(() => {
                window.location.href = this.href;
            }, 300);
        });
    }
}
document.addEventListener('DOMContentLoaded', initThemeToggle);
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
        const submitButton = this.querySelector('button[type="submit"]');
        if (submitButton && !submitButton.disabled) {
            const originalContent = submitButton.innerHTML;
            const loadingText = document.documentElement.lang === 'uk' ? 'Завантаження...' : 'Loading...';
            submitButton.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${loadingText}`;
            submitButton.disabled = true;
            setTimeout(() => {
                submitButton.innerHTML = originalContent;
                submitButton.disabled = false;
            }, 5000);
        }
    });
});

