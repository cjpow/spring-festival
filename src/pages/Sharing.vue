<template>
  <div class="highway-cost-calculator">
    <h1>高速费计算器 - 顺风车订单分摊</h1>

    <!-- 汇总区域：按订单维度，展示各路段费用及总计（置顶） -->
    <div class="summary-container summary-top">
      <h2>费用汇总（按订单）</h2>
      <table class="summary-table">
        <thead>
          <tr>
            <th>订单</th>
            <th v-for="(section, index) in highwaySections" :key="section.id">
              {{ section.name || `路段${index + 1}` }}
            </th>
            <th>总计</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td class="order-name-cell">
              <span class="order-name-tag" :style="orderTagStyle(order)">
                {{ order.name || `订单${order.id}` }} ({{ order.passengers }}人)
              </span>
            </td>
            <td v-for="(section, si) in highwaySections" :key="section.id">
              <template v-if="orderSummariesMap[order.id].sectionCosts[si] > 0">
                ¥{{ orderSummariesMap[order.id].sectionCosts[si].toFixed(2) }}
              </template>
              <span v-else class="cell-empty">—</span>
            </td>
            <td class="total-cell">¥{{ orderSummariesMap[order.id].total.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 左右结构：左侧订单管理，右侧高速路段列表 -->
    <div class="panels-row">
      <div class="panel-left">
        <div class="orders-global">
          <h2 class="block-title">订单管理</h2>
          <p class="hint">订单在此统一维护，右侧每个路段可勾选「参与该路段的订单」。</p>
          <div v-for="(order, orderIndex) in orders" :key="order.id" class="order-row">
            <label>
              名称:
              <input v-model="order.name" type="text" placeholder="如：订单A" class="input-name" />
            </label>
            <label>
              人数:
              <input
                v-model.number="order.passengers"
                type="number"
                min="1"
                max="8"
                @input="handleInputChange"
                class="input-num"
              />
            </label>
            <!-- <label>
              备注:
              <input v-model="order.remark" type="text" placeholder="选填" class="input-remark" />
            </label> -->
            <label class="color-label">
              颜色:
              <input
                v-model="order.color"
                type="color"
                class="input-color"
                title="选择订单标识颜色"
              />
            </label>
            <button @click="removeGlobalOrder(orderIndex)" class="btn-order-remove">删除</button>
          </div>
          <button @click="addGlobalOrder" class="btn-add-order">+ 添加订单</button>
        </div>
      </div>
      <div class="panel-right">
        <div v-for="(section, sectionIndex) in highwaySections" :key="section.id" class="section-container">
          <div class="section-header">
            <h2>{{ section.name || `高速路段 ${sectionIndex + 1}` }}</h2>
            <button @click="removeSection(sectionIndex)" class="btn-remove">删除路段</button>
          </div>

          <div class="section-info">
            <label>
              路段名称:
              <input
                v-model="section.name"
                type="text"
                placeholder="例如：高速费1"
              />
            </label>
            <label>
              总费用:
              <input
                v-model.number="section.totalCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="输入总费用"
                @input="handleInputChange"
              />
            </label>
          </div>

          <div class="participating-orders">
            <h3>参与本路段的订单</h3>
            <div v-if="orders.length === 0" class="no-orders-hint">请先在左侧「订单管理」添加订单。</div>
            <div v-else class="checkbox-list">
              <label
                v-for="order in orders"
                :key="order.id"
                class="checkbox-item"
              >
                <input
                  type="checkbox"
                  :checked="section.participatingOrderIds.includes(order.id)"
                  @change="toggleSectionOrder(sectionIndex, order.id, $event.target.checked)"
                />
                <span class="order-name-tag" :style="orderTagStyle(order)">{{ order.name || `订单${order.id}` }}</span>
                <span class="passengers-tag">({{ order.passengers }}人)</span>
                <span v-if="getOrderCostInSection(section, order.id) !== null" class="cost-tag">
                  ¥{{ getOrderCostInSection(section, order.id).toFixed(2) }}
                </span>
              </label>
            </div>
          </div>
        </div>
        <button @click="addSection" class="btn-add-section">+ 添加高速路段</button>
      </div>
    </div>

    <!-- 使用规则（置底） -->
    <div class="usage-rules">
      <div class="usage-rules-header" @click="showUsageRules = !showUsageRules">
        <span class="usage-rules-title">使用规则</span>
        <span class="usage-rules-toggle">{{ showUsageRules ? '收起' : '展开' }}</span>
      </div>
      <div v-show="showUsageRules" class="usage-rules-body">
        <ol>
          <li><strong>订单管理</strong>：在顶部统一维护所有订单，填写名称、人数和备注。同一订单可参与多个高速路段（如先接 A 再接 B 再一起上高速）。</li>
          <li><strong>高速路段</strong>：每个路段填写名称和该段高速总费用，在「参与本路段的订单」中勾选经过该路段的订单。</li>
          <li><strong>分摊方式</strong>：费用按人头均摊。某路段总费用 ÷ 该路段参与订单的总人数，再按各订单人数分配。例如 2 人订单占 2 份、1 人订单占 1 份。</li>
          <li><strong>费用汇总</strong>：上方表格按订单展示在各路段的分摊金额及总计；未参与的路段显示「—」。</li>
          <li><strong>数据保存</strong>：每次修改会自动保存到本地，刷新页面后会自动恢复，无需担心数据丢失。</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>
const STORAGE_KEY = 'highway-cost-calculator-data'

// 订单可选颜色（用于区分订单）
const ORDER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const defaultData = () => ({
  orders: [
    { id: 1, name: '司机', passengers: 1, remark: '', color: ORDER_COLORS[0] },
    { id: 2, name: '订单A', passengers: 1, remark: '', color: ORDER_COLORS[1] }
  ],
  highwaySections: [
    {
      id: 1,
      name: '高速费1',
      totalCost: 0,
      participatingOrderIds: [1, 2]
    }
  ],
  orderIdCounter: 2,
  sectionIdCounter: 1
})

export default {
  name: 'HighwayCostCalculator',
  data () {
    return {
      ...defaultData(),
      showUsageRules: false
    }
  },
  watch: {
    orders: {
      handler () {
        this.saveToStorage()
      },
      deep: true
    },
    highwaySections: {
      handler () {
        this.saveToStorage()
      },
      deep: true
    },
    orderIdCounter () {
      this.saveToStorage()
    },
    sectionIdCounter () {
      this.saveToStorage()
    }
  },
  mounted () {
    this.loadFromStorage()
  },
  computed: {
    // 每个订单在各路段的费用及总计 { orderId: { sectionCosts: number[], total: number } }
    orderSummariesMap () {
      const map = {}
      this.orders.forEach(order => {
        const sectionCosts = this.highwaySections.map(section => {
          const cost = this.getOrderCostInSection(section, order.id)
          return cost !== null ? cost : 0
        })
        const total = sectionCosts.reduce((a, b) => a + b, 0)
        map[order.id] = { sectionCosts, total }
      })
      return map
    }
  },
  methods: {
    saveToStorage () {
      try {
        const data = {
          orders: this.orders,
          highwaySections: this.highwaySections,
          orderIdCounter: this.orderIdCounter,
          sectionIdCounter: this.sectionIdCounter
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (e) {
        console.warn('保存到 localStorage 失败', e)
      }
    },

    loadFromStorage () {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const data = JSON.parse(raw)
        if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
          this.orders = data.orders.map(o => ({
            ...o,
            color: o.color && /^#[0-9a-fA-F]{6}$/.test(o.color) ? o.color : ORDER_COLORS[(o.id - 1) % ORDER_COLORS.length]
          }))
        }
        if (data.highwaySections && Array.isArray(data.highwaySections) && data.highwaySections.length > 0) {
          this.highwaySections = data.highwaySections
        }
        if (typeof data.orderIdCounter === 'number') {
          this.orderIdCounter = data.orderIdCounter
        }
        if (typeof data.sectionIdCounter === 'number') {
          this.sectionIdCounter = data.sectionIdCounter
        }
      } catch (e) {
        console.warn('从 localStorage 读取失败', e)
      }
    },

    // 订单名称标签样式（左侧色条 + 浅色底）
    orderTagStyle (order) {
      const color = order.color || ORDER_COLORS[0]
      return {
        borderLeftColor: color,
        backgroundColor: this.hexToRgba(color, 0.14)
      }
    },
    hexToRgba (hex, alpha) {
      const n = parseInt(hex.slice(1), 16)
      const r = (n >> 16) & 255
      const g = (n >> 8) & 255
      const b = n & 255
      return `rgba(${r},${g},${b},${alpha})`
    },

    // 某订单在某路段的分摊费用（未参与则返回 null）
    getOrderCostInSection (section, orderId) {
      if (!section.participatingOrderIds.includes(orderId)) return null
      const participating = this.orders.filter(o => section.participatingOrderIds.includes(o.id))
      const totalPassengers = participating.reduce((sum, o) => sum + o.passengers, 0)
      if (totalPassengers <= 0) return 0
      const order = this.orders.find(o => o.id === orderId)
      if (!order) return null
      return (section.totalCost * order.passengers) / totalPassengers
    },

    addGlobalOrder () {
      this.orderIdCounter++
      const letters = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const n = this.orders.length
      const name = n < letters.length ? `订单${letters[n]}` : `订单${this.orderIdCounter}`
      const colorIndex = this.orders.length % ORDER_COLORS.length
      this.orders.push({
        id: this.orderIdCounter,
        name,
        passengers: 1,
        remark: '',
        color: ORDER_COLORS[colorIndex]
      })
    },

    removeGlobalOrder (index) {
      if (this.orders.length <= 1) {
        alert('至少保留一个订单')
        return
      }
      const order = this.orders[index]
      const name = order.name || `订单${order.id}`
      if (!confirm(`确定要删除订单「${name}」吗？删除后该订单在各路段的参与关系也会被清除。`)) {
        return
      }
      const removedId = order.id
      this.orders.splice(index, 1)
      this.highwaySections.forEach(section => {
        const i = section.participatingOrderIds.indexOf(removedId)
        if (i !== -1) section.participatingOrderIds.splice(i, 1)
      })
    },

    toggleSectionOrder (sectionIndex, orderId, checked) {
      const ids = this.highwaySections[sectionIndex].participatingOrderIds
      const i = ids.indexOf(orderId)
      if (checked && i === -1) ids.push(orderId)
      if (!checked && i !== -1) ids.splice(i, 1)
    },

    addSection () {
      this.sectionIdCounter++
      this.highwaySections.push({
        id: this.sectionIdCounter,
        name: `高速费${this.sectionIdCounter}`,
        totalCost: 0,
        participatingOrderIds: this.orders.length ? [this.orders[0].id] : []
      })
    },

    removeSection (index) {
      if (this.highwaySections.length <= 1) {
        alert('至少保留一个高速路段')
        return
      }
      const section = this.highwaySections[index]
      const name = section.name || `高速路段 ${index + 1}`
      if (!confirm(`确定要删除路段「${name}」吗？`)) {
        return
      }
      this.highwaySections.splice(index, 1)
    },

    handleInputChange () {
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped lang="scss">
.highway-cost-calculator {
  padding: 12px 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 13px;
  max-width: 960px;
  margin: 0 auto;
  overflow-y: auto;
  height: 100%;
  color: #374151;
  background: linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%);

  h1 {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    color: #1e293b;
    margin: 0 0 16px 0;
    letter-spacing: 0.02em;
  }

  .usage-rules {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    margin-bottom: 12px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    .usage-rules-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      cursor: pointer;
      user-select: none;
      background: #f8fafc;

      &:hover {
        background: #f1f5f9;
      }

      .usage-rules-title {
        font-size: 13px;
        font-weight: 600;
        color: #334155;
      }

      .usage-rules-toggle {
        font-size: 11px;
        color: #64748b;
      }
    }

    .usage-rules-body {
      padding: 12px 14px 14px 20px;
      border-top: 1px solid #e2e8f0;
      background: #fff;
      text-align: left;

      ol {
        margin: 0;
        padding-left: 18px;
        font-size: 12px;
        line-height: 1.7;
        color: #475569;

        li {
          margin-bottom: 6px;

          &:last-child {
            margin-bottom: 0;
          }
        }

        strong {
          color: #334155;
        }
      }
    }
  }

  .panels-row {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    margin-bottom: 16px;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .panel-left {
    flex: 0 0 280px;
    min-width: 0;

    @media (max-width: 768px) {
      flex: 1 1 auto;
      width: 100%;
    }
  }

  .panel-right {
    flex: 1;
    min-width: 0;
  }

  .orders-global {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 0;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

    .block-title {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 6px 0;
      color: #334155;
      text-align: left;
    }

    .hint {
      font-size: 11px;
      color: #64748b;
      margin: 0 0 10px 0;
      text-align: left;
    }

    .order-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      padding: 6px 0;
      border-bottom: 1px solid #f1f5f9;

      &:last-of-type {
        border-bottom: none;
      }

      label {
        font-size: 11px;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .input-name {
        width: 72px;
        padding: 3px 5px;
        font-size: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
      }

      .input-num {
        width: 40px;
        padding: 3px 5px;
        font-size: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
      }

      .input-remark {
        width: 120px;
        padding: 3px 5px;
        font-size: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
      }

      .color-label {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .input-color {
        width: 28px;
        height: 24px;
        padding: 0;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        cursor: pointer;
        background: transparent;
      }

      .btn-order-remove {
        font-size: 11px;
        background: #94a3b8;
        color: white;
        border: none;
        padding: 3px 6px;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: #64748b;
        }
      }
    }

    .btn-add-order {
      font-size: 12px;
      background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 6px;

      &:hover {
        background: #2563eb;
      }
    }
  }

  .section-container {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 12px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      h2 {
        font-size: 14px;
        font-weight: 600;
        margin: 0;
        color: #334155;
      }

      .btn-remove {
        font-size: 12px;
        background: linear-gradient(180deg, #f87171 0%, #ef4444 100%);
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(239, 68, 68, 0.3);

        &:hover {
          background: #dc2626;
        }
      }
    }

    .section-info {
      display: flex;
      gap: 12px;
      margin-bottom: 10px;
      flex-wrap: wrap;

      label {
        font-size: 12px;
        color: #64748b;
        display: flex;
        flex-direction: column;
        min-width: 90px;
        text-align: left;

        input {
          font-size: 12px;
          margin-top: 3px;
          padding: 4px 6px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          width: 90px;

          &:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
          }
        }
      }
    }

    .participating-orders {
      h3 {
        font-size: 12px;
        font-weight: 600;
        margin: 0 0 6px 0;
        color: #475569;
        text-align: left;
        margin-top: 20px;
      }

      .no-orders-hint {
        font-size: 11px;
        color: #94a3b8;
        margin: 0;
      }

      .checkbox-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 14px;
      }

      .checkbox-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #475569;
        cursor: pointer;

        input[type="checkbox"] {
          margin: 0;
        }

        .passengers-tag {
          font-size: 11px;
          color: #94a3b8;
        }

        .cost-tag {
          font-size: 11px;
          font-weight: 500;
          color: #059669;
          margin-left: 2px;
        }
      }
    }
  }

  .btn-add-section {
    font-size: 13px;
    background: linear-gradient(180deg, #34d399 0%, #10b981 100%);
    color: white;
    border: none;
    padding: 6px 14px;
    border-radius: 8px;
    cursor: pointer;
    display: block;
    margin: 12px auto;
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);

    &:hover {
      background: #059669;
    }
  }

  .summary-container {
    margin-top: 16px;
    border: 1px solid #e2e8f0;

    &.summary-top {
      margin-top: 0;
      margin-bottom: 16px;
    }
    border-radius: 10px;
    padding: 12px 14px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

    h2 {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 10px 0;
      color: #334155;
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0;
      font-size: 12px;

      th, td {
        border: 1px solid #e2e8f0;
        padding: 6px 8px;
        text-align: center;
      }

      th {
        background: linear-gradient(180deg, #475569 0%, #334155 100%);
        color: #f8fafc;
        font-weight: 600;
        font-size: 11px;
      }

      td {
        color: #475569;
      }

      tbody tr:nth-child(even) {
        background: #f8fafc;
      }

      tbody tr:hover {
        background: #f1f5f9;
      }

      .order-name-cell {
        text-align: left;
        padding: 4px 8px;
      }

      .cell-empty {
        color: #cbd5e1;
      }

      .total-cell {
        font-weight: 600;
        color: #059669;
      }
    }
  }

  /* 订单名称标签（汇总表、高速路段参与订单通用） */
  .order-name-tag {
    display: inline-block;
    padding: 2px 8px 2px 6px;
    border-left: 3px solid;
    border-radius: 0 4px 4px 0;
    font-weight: 500;
  }
}
</style>
