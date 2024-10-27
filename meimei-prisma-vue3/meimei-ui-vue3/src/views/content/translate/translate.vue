<script setup lang="tsx">
import { ElInput, ElOption, ElSelect } from 'element-plus';
import { ref } from 'vue';
import { translate } from '../../../api/content/translate';
import { langs } from './langs';
import { useDebounceFn } from '@vueuse/core';

const query = ref('')
const from = ref('zh')
const to = ref('en')
const text = ref()

async function onChange() {
    text.value = ''
    if (query.value.length === 0) return
    const res = await translate({
        query: query.value,
        from: from.value,
        to: to.value
    })
    if (res.code === 200) {
        text.value = res.data.text
    }
}

const onChangeExec = useDebounceFn(() => {
    onChange()
}, 300)

</script>

<template>
    <div>
        <div class="p-4 w-full flex gap-4 pb-0">
            <ElSelect v-model="from" filterable>
                <template v-for="item of langs.baidu.langs" :key="item.lang">
                    <ElOption :value="item.lang" :label="item.label"  >{{ item.label }}</ElOption>
                </template>
            </ElSelect>
            <ElSelect v-model="to" filterable @change="onChangeExec">
                <template v-for="item of langs.baidu.langs" :key="item.lang">
                    <ElOption v-if="item.lang !== 'auto'" :value="item.lang" :label="item.label"  >{{ item.label }}</ElOption>
                </template>
            </ElSelect>
        </div>
        <div class="p-4 w-full flex gap-4">
            <div class="flex-1">
                <ElInput :rows="30" :type="'textarea'" v-model="query" @input="onChangeExec()" :maxlength="1000"></ElInput>
            </div>
            <div  class="flex-1">
                <ElInput :rows="30" :type="'textarea'" v-model="text" readonly></ElInput>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>