<template>
  <div class="highway-cost-calculator">
    <h1>高速费计算器 - 顺风车订单分摊</h1>

    <!-- 高速路段列表 -->
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

      <!-- 订单列表 -->
      <div class="orders-container">
        <h3>订单列表</h3>
        <div
          v-for="(order, orderIndex) in section.orders"
          :key="order.id"
          class="order-item"
        >
          <div class="order-info">
            <label>
              乘客数:
              <input
                v-model.number="order.passengers"
                type="number"
                min="1"
                max="8"
                @input="handleInputChange"
              />
            </label>

            <label>
              分摊费用: ¥{{ order.cost.toFixed(2) }}
            </label>

            <button @click="removeOrder(sectionIndex, orderIndex)" class="btn-order-remove">删除</button>
          </div>
        </div>

        <button @click="addOrder(sectionIndex)" class="btn-add-order">+ 添加订单</button>
      </div>
    </div>

    <button @click="addSection" class="btn-add-section">+ 添加高速路段</button>

    <!-- 汇总区域 -->
    <div class="summary-container">
      <h2>费用汇总</h2>
      <table class="summary-table">
        <thead>
          <tr>
            <th>订单编号</th>
            <th v-for="(section, index) in highwaySections" :key="section.id">
              {{ section.name || `高速路段 ${index + 1}` }}
            </th>
            <th>总计费用</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(summary, orderIndex) in orderSummaries" :key="orderIndex">
            <td>订单 {{ orderIndex + 1 }}</td>
            <td v-for="(cost, sectionIndex) in summary.sectionCosts" :key="sectionIndex">
              ¥{{ cost.toFixed(2) }}
            </td>
            <td>¥{{ summary.total.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HighwayCostCalculator',
  data () {
    return {
      highwaySections: [
        {
          id: 1,
          name: '高速费1',
          totalCost: 0,
          orders: [
            { id: 1, passengers: 1, cost: 0 },
            { id: 2, passengers: 1, cost: 0 }
          ]
        }
      ],
      sectionIdCounter: 1,
      orderIdCounter: 2
    }
  },
  mounted () {
    this.calculateAllCosts()
  },
  computed: {
    orderSummaries () {
      // 找到最大订单数量以确定行数（无订单时避免 Math.max(...[]) 为 -Infinity）
      const lengths = this.highwaySections.map(section => section.orders.length)
      const maxOrders = lengths.length ? Math.max(...lengths) : 0

      const summaries = []

      for (let i = 0; i < maxOrders; i++) {
        const summary = {
          sectionCosts: [],
          total: 0
        }

        this.highwaySections.forEach(section => {
          if (i < section.orders.length) {
            summary.sectionCosts.push(section.orders[i].cost)
            summary.total += section.orders[i].cost
          } else {
            summary.sectionCosts.push(0)
          }
        })

        summaries.push(summary)
      }

      return summaries
    }
  },
  methods: {
    // 添加新的高速路段
    addSection () {
      this.sectionIdCounter++
      this.orderIdCounter++
      this.highwaySections.push({
        id: this.sectionIdCounter,
        name: `高速费${this.sectionIdCounter}`,
        totalCost: 0,
        orders: [{ id: this.orderIdCounter, passengers: 1, cost: 0 }]
      })
      this.calculateAllCosts()
    },

    // 删除高速路段
    removeSection (index) {
      if (this.highwaySections.length > 1) {
        this.highwaySections.splice(index, 1)
      } else {
        alert('至少保留一个高速路段')
      }
    },

    // 为指定路段添加订单
    addOrder (sectionIndex) {
      this.orderIdCounter++
      this.highwaySections[sectionIndex].orders.push({
        id: this.orderIdCounter,
        passengers: 1,
        cost: 0
      })
      this.calculateAllCosts()
    },

    // 删除指定路段的订单
    removeOrder (sectionIndex, orderIndex) {
      if (this.highwaySections[sectionIndex].orders.length > 1) {
        this.highwaySections[sectionIndex].orders.splice(orderIndex, 1)
      } else {
        alert('每个路段至少保留一个订单')
      }
      this.calculateAllCosts()
    },

    // 计算所有订单的费用
    calculateAllCosts () {
      this.highwaySections.forEach(section => {
        const totalPassengers = section.orders.reduce((sum, order) => sum + order.passengers, 0)

        if (totalPassengers > 0) {
          section.orders.forEach(order => {
            order.cost = (section.totalCost * order.passengers) / totalPassengers
          })
        } else {
          section.orders.forEach(order => {
            order.cost = 0
          })
        }
      })
    },

    // 监听输入变化，重新计算费用
    handleInputChange () {
      setTimeout(this.calculateAllCosts, 0)
    }
  }
}
</script>

<style scoped lang="scss">
.highway-cost-calculator {
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  overflow-y: scroll;
  height: 100%;

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
  }

  .section-container {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    background-color: #f9f9f9;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h2 {
        margin: 0;
        color: #444;
      }

      .btn-remove {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background-color: #c0392b;
        }
      }
    }

    .section-info {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
      flex-wrap: wrap;

      label {
        display: flex;
        flex-direction: column;
        min-width: 120px;

        input {
          margin-top: 5px;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      }
    }

    .orders-container {
      h3 {
        margin: 0 0 10px 0;
        color: #555;
      }

      .order-item {
        border: 1px solid #eee;
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 10px;
        background-color: white;

        .order-info {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;

          label {
            display: flex;
            flex-direction: column;
            min-width: 100px;

            input {
              margin-top: 5px;
              padding: 5px;
              border: 1px solid #ccc;
              border-radius: 4px;
              width: 80px;
            }
          }

          .btn-order-remove {
            background-color: #95a5a6;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;

            &:hover {
              background-color: #7f8c8d;
            }
          }
        }
      }

      .btn-add-order {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background-color: #2980b9;
        }
      }
    }
  }

  .btn-add-section {
    background-color: #2ecc71;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    display: block;
    margin: 20px auto;

    &:hover {
      background-color: #27ae60;
    }
  }

  .summary-container {
    margin-top: 30px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    background-color: #f0f8ff;

    h2 {
      margin-top: 0;
      color: #333;
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;

      th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: center;
      }

      th {
        background-color: #4CAF50;
        color: white;
      }

      tr:nth-child(even) {
        background-color: #f2f2f2;
      }

      tr:hover {
        background-color: #f5f5f5;
      }
    }
  }
}
</style>
