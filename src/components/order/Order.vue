<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <!-- 搜索框 -->
          <el-input
            placeholder="请输入订单内容"
            v-model="queryInfo.query"
            class="input-with-select"
            @input="getOrderList"
            @change="getOrderList"
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表表格 -->
      <el-table :data="orderList" stripe border style="width: 100%;">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="250">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格"> </el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success"
              >已付款</el-tag
            >
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货">
          <template slot-scope="scope">
            <template>
              {{ scope.row.is_send }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showAddressDialog"
            ></el-button>
            <el-button
              type="success"
              size="mini"
              icon="el-icon-setting"
              @click="showProcessDialog"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>

    <!-- 编辑地址对话框 -->
    <el-dialog
      title="添加地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogCloseable"
    >
      <!-- 表单数据 -->
      <el-form
        :model="addressForm"
        :rules="addressRules"
        ref="addressRef"
        label-width="100px"
      >
        <el-form-item label="省市区" prop="address1">
          <!-- 省市级级联框 -->
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>

        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 快递进度 -->
    <el-dialog
      title="物流进度"
      :visible.sync="processDialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in processDataList"
          :key="index"
          :timestamp="item.ftime"
        >
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      orderInput: '',
      orderList: [],
      total: 0,
      addressDialogVisible: false,
      addressForm: {
        address1: [],
        address2: '',
      },
      addressRules: {
        address1: [
          { required: true, message: '请输入省市级', trigger: 'blur' },
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
      },
      cityData,
      processDialogVisible: false,
      processDataList: [],
    }
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取订单列表数据失败')
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 页数改变
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getOrderList()
    },
    // 当前页
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getOrderList()
    },
    // 展示编辑对话框
    showAddressDialog() {
      this.addressDialogVisible = true
    },
    //
    handleChange() {},
    // 关闭对话框
    addressDialogCloseable() {
      this.$refs.addressRef.resetFields()
    },
    //
    async showProcessDialog() {
      const { data: res } = await this.$http.get(`/kuaidi/1106975712662`)
      if (res.meta.status !== 200) this.$message.error('查询物流信息失败')
      this.processDataList = res.data
      console.log(this.processDataList)
      this.processDialogVisible = true
    },
  },

  created() {
    this.getOrderList()
  },
}
</script>

<style lang="less" scoped>
.input-with-select {
  width: 300px;
}
.el-cascader {
  width: 300px;
}
</style>