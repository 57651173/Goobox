<template>
  <div class="about-container">
    <div class="about-content">
      <h1 class="page-title">{{ t('about.title') }}</h1>
      
      <div class="about-section">
        <h2>{{ t('about.version') }}</h2>
        <p>1.0.0 Beta</p>
      </div>
      
      <div class="about-section">
        <h2>{{ t('about.projectDescription') }}</h2>
        <p>{{ t('about.projectDescriptionText') }}</p>
      </div>
      
      <div class="about-section">
        <h2>{{ t('about.contact') }}</h2>
        <p>Email: support@goobox.com</p>
        <p>GitHub: <a href="https://github.com/goobox" target="_blank">github.com/goobox</a></p>
      </div>
      
      <div class="about-section donation-section">
        <h2>{{ t('about.donation') }}</h2>
        <p>{{ t('about.donationDescription') }}</p>
        
        <div class="donation-methods">
          <div class="donation-method">
            <a-icon type="credit-card" class="donation-icon" />
            <h3>{{ t('about.donationMethodPaypal') }}</h3>
            <a-button type="primary" href="https://paypal.me/goobox" target="_blank">
              PayPal
            </a-button>
          </div>
          
          <div class="donation-method">
            <a-icon type="wallet" class="donation-icon" />
            <h3>{{ t('about.donationMethodCrypto') }}</h3>
            <div class="crypto-addresses">
              <p><strong>BTC:</strong> 3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5</p>
              <p><strong>ETH:</strong> 0x742d35Cc6634C0532925a3b844Bc454e4438f44e</p>
            </div>
          </div>
        </div>
        
        <div class="donation-tiers">
          <h3>{{ t('about.donationTiers') }}</h3>
          <div class="tier-buttons">
            <a-button class="tier-button" @click="donateAmount(5)">$5</a-button>
            <a-button class="tier-button" @click="donateAmount(10)">$10</a-button>
            <a-button class="tier-button" @click="donateAmount(20)">$20</a-button>
            <a-button class="tier-button" @click="donateAmount(50)">$50</a-button>
            <a-button class="tier-button" @click="donateAmount(100)">$100</a-button>
          </div>
        </div>
      </div>
      
      <div class="about-section supporters-section">
        <h2>{{ t('about.supporters') }}</h2>
        <p>{{ t('about.supportersThankYou') }}</p>
        <div class="supporters-list">
          <a-card :bordered="false">
            <a-list 
              :dataSource="supporters"
              :pagination="{ pageSize: 5 }"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta :title="item.name">
                    <template #description>
                      <span>{{ item.amount }}</span>
                      <span class="supporter-date">{{ item.date }}</span>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </div>
      </div>
      
      <div class="free-forever">
        <a-tag color="green">{{ t('home.freeForever') }}</a-tag>
        <p>{{ t('about.freeForeverPromise') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 模拟支持者数据
const supporters = ref([
  { name: 'John Doe', amount: '$50', date: '2023-05-15' },
  { name: 'Jane Smith', amount: '$100', date: '2023-04-22' },
  { name: 'Robert Johnson', amount: '$20', date: '2023-04-10' },
  { name: 'Lisa Wang', amount: '$30', date: '2023-03-28' },
  { name: 'Michael Brown', amount: '$75', date: '2023-03-15' },
  { name: 'Sarah Miller', amount: '$25', date: '2023-02-20' },
  { name: 'David Wilson', amount: '$40', date: '2023-02-05' }
])

// 捐款金额方法
const donateAmount = (amount) => {
  window.open(`https://paypal.me/goobox/${amount}`, '_blank')
}
</script>

<style scoped>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1a1a1a;
  text-align: center;
}

.about-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.about-section h2 {
  color: #1890ff;
  font-size: 1.5rem;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.about-section a {
  color: #1890ff;
  text-decoration: none;
}

.donation-section {
  background-color: #f7faff;
  border: 1px solid #e6f7ff;
}

.donation-methods {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 24px;
  margin-bottom: 24px;
}

.donation-method {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.donation-icon {
  font-size: 36px;
  color: #1890ff;
  margin-bottom: 16px;
}

.crypto-addresses {
  margin-top: 12px;
  margin-bottom: 12px;
  text-align: left;
  font-size: 0.85rem;
}

.donation-tiers {
  margin-top: 24px;
  text-align: center;
}

.tier-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.tier-button {
  min-width: 80px;
}

.supporters-section {
  background-color: #fffdf7;
}

.supporters-list {
  margin-top: 16px;
}

.supporter-date {
  color: #999;
  margin-left: 12px;
  font-size: 0.85rem;
}

.free-forever {
  text-align: center;
  margin-top: 30px;
  padding: 24px;
  background-color: #f6ffed;
  border-radius: 8px;
  border: 1px solid #b7eb8f;
}

.free-forever p {
  margin-top: 12px;
  color: #52c41a;
}

@media (min-width: 1024px) {
  .about-container {
    padding: 60px 40px;
  }
  
  .donation-methods {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .about-container {
    padding: 30px 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .about-section {
    padding: 20px;
  }
  
  .donation-methods {
    flex-direction: column;
  }
  
  .crypto-addresses {
    font-size: 0.8rem;
  }
}
</style>
