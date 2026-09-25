document.addEventListener('DOMContentLoaded', () => {
  // Backend API Endpoint URL
  const API_URL = 'http://127.0.0.1:8000/predict';

  // Element Selectors
  const form = document.getElementById('prediction-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');

  const modal = document.getElementById('results-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalActionBtn = document.getElementById('modal-action-btn');

  const scoreValue = document.getElementById('score-value');
  const statusBadge = document.getElementById('status-badge');
  const badgeIcon = document.getElementById('badge-icon');
  const riskDescription = document.getElementById('risk-description');

  // Form Submit Handler
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideError();

    // Payload aligned directly with FastAPI StudentData Pydantic Schema
    const payload = {
      age: parseInt(document.getElementById('age').value, 10),
      gender: document.getElementById('gender').value,
      country: document.getElementById('country').value,
      academic_level: document.getElementById('academic_level').value,
      most_used_platform: document.getElementById('most_used_platform').value,
      purpose_of_use: document.getElementById('purpose_of_use').value,
      avg_daily_usage_hours: parseFloat(document.getElementById('avg_daily_usage_hours').value),
      daily_unlocks: parseInt(document.getElementById('daily_unlocks').value, 10),
      study_hours: parseFloat(document.getElementById('study_hours').value),
      physical_activity_hours: parseFloat(document.getElementById('physical_activity_hours').value),
      sleep_hours_per_night: parseFloat(document.getElementById('sleep_hours_per_night').value),
      stress_level: document.getElementById('stress_level').value
    };

    setLoadingState(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail?.[0]?.msg || `Server responded with HTTP ${response.status}`);
      }

      const data = await response.json();
      displayResults(data.predicted_mental_health_score);

    } catch (error) {
      console.error('API Error:', error);
      showError(error.message || 'Unable to connect to prediction backend. Please check server status.');
    } finally {
      setLoadingState(false);
    }
  });

  // UI Control Functions
  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.classList.add('hidden');
      btnSpinner.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
    }
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.remove('hidden');
  }

  function hideError() {
    errorBanner.classList.add('hidden');
  }

  function displayResults(score) {
    scoreValue.textContent = score.toFixed(2);

    // Apply risk status theme based on mental health score range
    if (score >= 7.0) {
      statusBadge.textContent = 'High Well-being / Low Risk';
      statusBadge.style.backgroundColor = 'var(--risk-low-bg)';
      statusBadge.style.color = 'var(--risk-low-text)';
      badgeIcon.style.backgroundColor = 'var(--risk-low-bg)';
      badgeIcon.style.color = 'var(--risk-low-text)';
      riskDescription.textContent = 'Your daily habits and stress levels reflect a healthy balance and low risk profile.';
    } else if (score >= 4.0) {
      statusBadge.textContent = 'Moderate Well-being / Medium Risk';
      statusBadge.style.backgroundColor = 'var(--risk-med-bg)';
      statusBadge.style.color = 'var(--risk-med-text)';
      badgeIcon.style.backgroundColor = 'var(--risk-med-bg)';
      badgeIcon.style.color = 'var(--risk-med-text)';
      riskDescription.textContent = 'Your current lifestyle parameters show moderate strain. Adjusting study hours, sleep, or social media usage may help.';
    } else {
      statusBadge.textContent = 'Elevated Risk / High Attention Needed';
      statusBadge.style.backgroundColor = 'var(--risk-high-bg)';
      statusBadge.style.color = 'var(--risk-high-text)';
      badgeIcon.style.backgroundColor = 'var(--risk-high-bg)';
      badgeIcon.style.color = 'var(--risk-high-text)';
      riskDescription.textContent = 'Your current score suggests a higher risk of stress or fatigue. Consider improving your sleep hygiene and reducing screen time.';
    }

    modal.classList.remove('hidden');
  }

  // Modal Close Listeners
  closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modalActionBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
});