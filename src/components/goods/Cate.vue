<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
        index-text="#"
        show-index
        border
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="operation" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="deleteCate(scope.row)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="50%">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialog">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addFormdialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 表单区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRule"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <el-cascader
            class="cascader"
            v-model="selectedKey"
            :options="parentCateList"
            :props="cascaderProp"
            @change="handleChange"
            ref="cascaderRef"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addFormdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 调用参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类列表
      cateList: [],
      // 分类总共
      total: 0,
      // table组件的列属性
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok',
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation',
        },
      ],
      // 展示对话框
      addFormdialogVisible: false,
      // 表单属性
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0,
      },
      // 表单校验规则
      addCateFormRule: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      // 一级和二级分类数据
      parentCateList: [],
      // 级联属性
      cascaderProp: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true,
      },
      // 选中的父级分类的id数组
      selectedKey: [],
      display: {
        display: 'none',
      },
      // 控制编辑按钮对话框的隐藏和显示
      editDialogVisible: false,
      // 编辑对话框表单
      editForm: {
        cat_id: 0,
        cat_name: '',
      },
      // 编辑对话框表单校验规则
      editFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    // 获取商品分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('/categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类数据失败!')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听每页的展示数量改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击添加分类展示对话框
    showAddDialog() {
      // 获取一级和二级分类的数据
      this.getparentCateList()
      // 展示对话框
      this.addFormdialogVisible = true
    },
    // 请求获取一级和二级分类数据接口
    async getparentCateList() {
      const { data: res } = await this.$http.get('/categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200)
        return this.$message.error('请求获取一级和二级数据失败')
      this.parentCateList = res.data
    },
    // 监听级联选择器change事件
    handleChange(value) {
      this.selectedKey = value
      // 选中了某个分类
      if (this.selectedKey.length > 0) {
        // 父级分类id
        this.addCateForm.cat_pid = this.selectedKey[this.selectedKey.length - 1]
        // 等级
        this.addCateForm.cat_level = this.selectedKey.length
      } else {
        // 父级分类id
        this.addCateForm.cat_pid = 0
        // 等级
        this.addCateForm.cat_level = 0
      }
      // 关闭下拉框
      this.$refs.cascaderRef.toggleDropDownVisible()
    },
    // 点击添加按钮
    addCate() {
      // 预校验
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          '/categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addFormdialogVisible = false
      })
    },
    // 关闭对话框触发事件
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKey = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 点击编辑按钮弹出对话框
    showEditDialog(row) {
      this.editDialogVisible = true
      this.editForm.cat_name = row.cat_name
      this.editForm.cat_id = row.cat_id
    },
    // 编辑对话框点击确定按钮
    editDialog() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.editForm.cat_id}`,
          {
            cat_name: this.editForm.cat_name,
          }
        )
        if (res.meta.status !== 200) return this.$message.error('修改分类失败')
        this.$message.success('修改分类成功')
        this.editDialogVisible = false
        this.getCateList()
      })
    },
    // 删除分类
    async deleteCate(row) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除')
      const { data: res } = await this.$http.delete(`categories/${row.cat_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getCateList()
    },
  },
  created() {
    this.getCateList()
  },
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.cascader {
  width: 100%;
}
</style>