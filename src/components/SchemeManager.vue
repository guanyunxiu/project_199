<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="方案管理" 
    width="700px"
    :close-on-click-modal="false"
  >
    <div class="scheme-manager">
      <div class="manager-tabs">
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="我的方案" name="list">
            <div class="scheme-list">
              <div 
                v-for="scheme in configEditorStore.savedSchemes" 
                :key="scheme.id"
                class="scheme-item"
                :class="{ 'active': configEditorStore.currentScheme.id === scheme.id }"
                @click="selectScheme(scheme)"
              >
                <div class="scheme-icon">
                  <el-icon :size="28"><FolderOpened /></el-icon>
                </div>
                <div class="scheme-info">
                  <div class="scheme-name">{{ scheme.name }}</div>
                  <div class="scheme-desc">{{ scheme.description || '暂无描述' }}</div>
                  <div class="scheme-meta">
                    <span><el-icon :size="12"><Calendar /></el-icon> {{ formatDate(scheme.updatedAt) }}</span>
                    <span><el-icon :size="12"><Grid /></el-icon> {{ scheme.nodes.length }} 节点</span>
                    <span><el-icon :size="12"><Connection /></el-icon> {{ scheme.paths.length }} 路径</span>
                  </div>
                </div>
                <div class="scheme-actions">
                  <el-button 
                    type="primary" 
                    size="small"
                    @click.stop="loadScheme(scheme.id)"
                  >
                    加载
                  </el-button>
                  <el-button 
                    size="small"
                    @click.stop="openRenameDialog(scheme)"
                  >
                    重命名
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small"
                    @click.stop="deleteScheme(scheme.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
              
              <div v-if="configEditorStore.savedSchemes.length === 0" class="empty-list">
                <el-empty description="暂无保存的方案" />
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="保存新方案" name="save">
            <el-form label-width="100px" class="save-form">
              <el-form-item label="方案名称" required>
                <el-input v-model="saveForm.name" placeholder="请输入方案名称" maxlength="50" show-word-limit />
              </el-form-item>
              <el-form-item label="方案描述">
                <el-input 
                  v-model="saveForm.description" 
                  type="textarea" 
                  :rows="4" 
                  placeholder="请输入方案描述（可选）" 
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="当前配置">
                <div class="config-preview">
                  <span class="preview-item">
                    <el-icon><Grid /></el-icon>
                    {{ configEditorStore.nodes.length }} 个节点
                  </span>
                  <span class="preview-item">
                    <el-icon><Connection /></el-icon>
                    {{ configEditorStore.paths.length }} 条路径
                  </span>
                  <span class="preview-item">
                    <el-icon><Link /></el-icon>
                    {{ configEditorStore.connections.length }} 个连接
                  </span>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveNewScheme" :disabled="!saveForm.name.trim()">
                  <el-icon><Check /></el-icon>
                  保存方案
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <el-dialog 
      v-model="renameDialogVisible" 
      title="重命名方案" 
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="方案名称">
          <el-input v-model="renameForm.name" placeholder="请输入新的方案名称" />
        </el-form-item>
        <el-form-item label="方案描述">
          <el-input 
            v-model="renameForm.description" 
            type="textarea" 
            :rows="2" 
            placeholder="请输入方案描述（可选）" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRename">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  FolderOpened, Calendar, Grid, Connection, Link, Check 
} from '@element-plus/icons-vue'
import { useConfigEditorStore } from '@/store/configEditor'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'save'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const configEditorStore = useConfigEditorStore()

const activeTab = ref('list')
const renameDialogVisible = ref(false)

const saveForm = reactive({
  name: '',
  description: ''
})

const renameForm = reactive({
  id: '',
  name: '',
  description: ''
})

watch(() => props.visible, (val) => {
  if (val) {
    saveForm.name = configEditorStore.currentScheme.name
    saveForm.description = configEditorStore.currentScheme.description
  }
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const selectScheme = (scheme) => {
}

const loadScheme = (schemeId) => {
  ElMessageBox.confirm('加载方案将覆盖当前配置，确定继续吗？', '加载确认', {
    type: 'warning'
  }).then(() => {
    const success = configEditorStore.loadScheme(schemeId)
    if (success) {
      ElMessage.success('方案加载成功')
      emit('update:visible', false)
    } else {
      ElMessage.error('方案加载失败')
    }
  }).catch(() => {})
}

const saveNewScheme = () => {
  if (!saveForm.name.trim()) {
    ElMessage.warning('请输入方案名称')
    return
  }
  
  configEditorStore.saveScheme(saveForm.name.trim(), saveForm.description.trim())
  emit('save', { name: saveForm.name.trim(), description: saveForm.description.trim() })
  ElMessage.success('方案保存成功')
  activeTab.value = 'list'
}

const openRenameDialog = (scheme) => {
  renameForm.id = scheme.id
  renameForm.name = scheme.name
  renameForm.description = scheme.description || ''
  renameDialogVisible.value = true
}

const confirmRename = () => {
  if (!renameForm.name.trim()) {
    ElMessage.warning('请输入方案名称')
    return
  }
  
  const scheme = configEditorStore.savedSchemes.find(s => s.id === renameForm.id)
  if (scheme) {
    scheme.name = renameForm.name.trim()
    scheme.description = renameForm.description.trim()
    scheme.updatedAt = new Date().toISOString()
    
    localStorage.setItem('config_schemes', JSON.stringify(configEditorStore.savedSchemes))
    
    if (configEditorStore.currentScheme.id === renameForm.id) {
      configEditorStore.currentScheme.name = scheme.name
      configEditorStore.currentScheme.description = scheme.description
      configEditorStore.currentScheme.updatedAt = scheme.updatedAt
    }
    
    ElMessage.success('方案已更新')
  }
  
  renameDialogVisible.value = false
}

const deleteScheme = (schemeId) => {
  ElMessageBox.confirm('确定要删除这个方案吗？此操作不可撤销。', '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    confirmButtonClass: 'el-button--danger'
  }).then(() => {
    configEditorStore.deleteScheme(schemeId)
    ElMessage.success('方案已删除')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.scheme-manager {
  .manager-tabs {
    :deep(.el-tabs__item) {
      color: $text-color-secondary;
      
      &.is-active {
        color: $primary-color;
      }
    }
    
    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }
  }
  
  .scheme-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 8px;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(24, 144, 255, 0.2);
      border-radius: 3px;
    }
    
    .scheme-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(10, 22, 40, 0.6);
      border: 1px solid rgba(24, 144, 255, 0.15);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(24, 144, 255, 0.08);
        border-color: rgba(24, 144, 255, 0.3);
        transform: translateX(4px);
      }
      
      &.active {
        border-color: $primary-color;
        background: rgba(24, 144, 255, 0.1);
      }
      
      .scheme-icon {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(24, 144, 255, 0.15);
        border-radius: 12px;
        color: $primary-color;
        flex-shrink: 0;
      }
      
      .scheme-info {
        flex: 1;
        min-width: 0;
        
        .scheme-name {
          font-size: 15px;
          font-weight: 600;
          color: $text-color-primary;
          margin-bottom: 4px;
        }
        
        .scheme-desc {
          font-size: 12px;
          color: $text-color-secondary;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .scheme-meta {
          display: flex;
          gap: 16px;
          font-size: 11px;
          color: $text-color-tertiary;
          
          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
      
      .scheme-actions {
        display: flex;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      &:hover .scheme-actions {
        opacity: 1;
      }
    }
    
    .empty-list {
      padding: 40px 0;
    }
  }
  
  .save-form {
    max-width: 500px;
    margin: 0 auto;
    
    .config-preview {
      display: flex;
      gap: 24px;
      padding: 12px 16px;
      background: rgba(10, 22, 40, 0.6);
      border-radius: 8px;
      
      .preview-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: $text-color-secondary;
        
        .el-icon {
          color: $primary-color;
        }
      }
    }
  }
}
</style>
