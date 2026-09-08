<template>
  <div class="space-y-6">
    <!-- Header with AI Copilot Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-teal-500/30">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xl">🗃️</span>
          <h3 class="text-lg font-bold text-white">Database Entities & CRUD Designer</h3>
          <span class="text-xs bg-teal-500/10 text-teal-400 font-mono px-2 py-0.5 rounded border border-teal-500/20">
            {{ store.config.entities.length }} Entities
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-1">Design your database tables and fields. The engine automatically creates models, migrations, REST APIs, and UI views.</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- AI Prompt Modal Trigger -->
        <button 
          @click="showAiModal = true"
          class="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-2 transition transform hover:scale-[1.02]"
        >
          <span>✨</span>
          <span>AI Prompt-to-Schema</span>
        </button>

        <button 
          @click="addNewEntity"
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
        >
          <span>＋</span>
          <span>Add Entity</span>
        </button>
      </div>
    </div>

    <!-- Entity Cards List -->
    <div class="space-y-6">
      <div 
        v-for="(entity, eIdx) in store.config.entities" 
        :key="entity.id"
        class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
      >
        <!-- Entity Card Header -->
        <div class="px-6 py-4 bg-slate-800/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 flex-1">
            <span class="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-500/20">
              #{{ eIdx + 1 }}
            </span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-xl">
              <div>
                <label class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Entity Name (PascalCase)</label>
                <input 
                  v-model="entity.name" 
                  type="text" 
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Display Label</label>
                <input 
                  v-model="entity.label" 
                  type="text" 
                  class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center">
            <button 
              @click="addFieldToEntity(entity.id)"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 transition flex items-center gap-1"
            >
              <span>＋ Add Field</span>
            </button>
            <button 
              @click="store.removeEntity(entity.id)"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
              title="Delete Entity"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Fields Table -->
        <div class="p-6">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="text-slate-400 uppercase font-semibold border-b border-slate-800 pb-2">
                <tr>
                  <th class="pb-3 px-2">Field Name</th>
                  <th class="pb-3 px-2">Label</th>
                  <th class="pb-3 px-2">Data Type</th>
                  <th class="pb-3 px-2 text-center">Required</th>
                  <th class="pb-3 px-2 text-center">Unique</th>
                  <th class="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-normal">
                <!-- System ID (Readonly) -->
                <tr class="text-slate-500">
                  <td class="py-2.5 px-2 font-mono">id (Primary Key)</td>
                  <td class="py-2.5 px-2">System ID</td>
                  <td class="py-2.5 px-2 font-mono">int (auto-increment)</td>
                  <td class="py-2.5 px-2 text-center">✓</td>
                  <td class="py-2.5 px-2 text-center">✓</td>
                  <td class="py-2.5 px-2 text-right text-[11px] italic">Auto-generated</td>
                </tr>

                <!-- User Fields -->
                <tr v-for="field in entity.fields" :key="field.id" class="hover:bg-slate-800/30 transition">
                  <td class="py-2.5 px-2">
                    <input 
                      v-model="field.name" 
                      type="text" 
                      placeholder="e.g. price"
                      class="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                    />
                  </td>
                  <td class="py-2.5 px-2">
                    <input 
                      v-model="field.label" 
                      type="text" 
                      placeholder="e.g. Price (THB)"
                      class="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </td>
                  <td class="py-2.5 px-2">
                    <select 
                      v-model="field.type"
                      class="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                    >
                      <option value="string">string (Text / Varchar)</option>
                      <option value="int">int (Integer)</option>
                      <option value="decimal">decimal (Money / Float)</option>
                      <option value="boolean">boolean (True / False)</option>
                      <option value="datetime">datetime (Timestamp)</option>
                      <option value="text">text (Long Text / Note)</option>
                    </select>
                  </td>
                  <td class="py-2.5 px-2 text-center">
                    <input 
                      v-model="field.required" 
                      type="checkbox" 
                      class="w-4 h-4 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500"
                    />
                  </td>
                  <td class="py-2.5 px-2 text-center">
                    <input 
                      v-model="field.isUnique" 
                      type="checkbox" 
                      class="w-4 h-4 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500"
                    />
                  </td>
                  <td class="py-2.5 px-2 text-right">
                    <button 
                      @click="store.removeField(entity.id, field.id)"
                      class="text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-500/10 transition"
                      title="Remove field"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Prompt-to-Schema Modal -->
    <div v-if="showAiModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate__animated animate__fadeIn animate__faster">
      <div class="bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate__animated animate__zoomIn animate__faster">
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">✨</span>
            <h3 class="font-bold text-white text-base">AI Copilot: Prompt-to-Schema</h3>
          </div>
          <button @click="showAiModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <div class="p-6 space-y-4">
          <p class="text-xs text-slate-300 leading-relaxed">
            Describe your application in Thai or English. AI will automatically design database entities, fields, data types, and validations for you!
          </p>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Your Prompt / Requirements</label>
            <textarea 
              v-model="aiPrompt"
              rows="4" 
              placeholder="e.g. ระบบคลินิกสัตว์เลี้ยง มีข้อมูลสัตว์เลี้ยง เจ้าของ การนัดหมาย และประวัติการรักษา"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            ></textarea>
          </div>

          <!-- Quick Example Chips -->
          <div>
            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Or click an example:</span>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="example in examples" 
                :key="example"
                type="button"
                @click="aiPrompt = example"
                class="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                {{ example }}
              </button>
            </div>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button 
              type="button" 
              @click="showAiModal = false"
              class="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button 
              type="button" 
              @click="submitAiPrompt"
              :disabled="loadingAi || !aiPrompt.trim()"
              class="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 hover:from-teal-300 hover:to-emerald-300 transition shadow-lg shadow-teal-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="loadingAi" class="animate-spin">🌀</span>
              <span>{{ loadingAi ? 'Designing Schema with AI...' : 'Generate Schema' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTemplateStore } from '~/stores/templateStore'
import type { EntityModel, EntityField } from '~/types/template'

const store = useTemplateStore()
const showAiModal = ref(false)
const aiPrompt = ref('')
const loadingAi = ref(false)

const examples = [
  'ระบบคลินิกสัตว์เลี้ยง มีสัตว์เลี้ยง เจ้าของ นัดหมาย ค่ารักษา',
  'ระบบร้านกาแฟ มีเมนู วัตถุดิบ ออเดอร์ ช่องทางชำระเงิน',
  'ระบบจัดการโรงเรียน มีคอร์สเรียน นักเรียน ครู การลงทะเบียน',
  'ระบบคลังสินค้า มีสต็อกสินค้า ตำแหน่งจัดเก็บ การเบิกจ่าย'
]

const addNewEntity = () => {
  const count = store.config.entities.length + 1
  const newEntity: EntityModel = {
    id: `entity_${Date.now()}`,
    name: `NewEntity${count}`,
    label: `ข้อมูลใหม่ ${count}`,
    fields: [
      { id: `f_${Date.now()}_1`, name: 'title', type: 'string', required: true, label: 'Title / Name' },
      { id: `f_${Date.now()}_2`, name: 'description', type: 'text', required: false, label: 'Description' }
    ]
  }
  store.addEntity(newEntity)
}

const addFieldToEntity = (entityId: string) => {
  const newField: EntityField = {
    id: `f_${Date.now()}`,
    name: 'newField',
    type: 'string',
    required: true,
    label: 'New Field'
  }
  store.addField(entityId, newField)
}

const submitAiPrompt = async () => {
  if (!aiPrompt.value.trim()) return
  loadingAi.value = true
  try {
    const res = await $fetch<{ success: boolean; entities: EntityModel[] }>('/api/ai/schema', {
      method: 'POST',
      body: { prompt: aiPrompt.value }
    })

    if (res.success && res.entities?.length > 0) {
      store.setEntitiesFromAI(res.entities)
      showAiModal.value = false
      aiPrompt.value = ''
    }
  } catch (err) {
    alert('AI Schema Generation failed. Please try again.')
    console.error(err)
  } finally {
    loadingAi.value = false
  }
}
</script>
