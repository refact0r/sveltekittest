<script context="module">
	export async function load({ session }) {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/login'
			}
		}
		return {}
	}
</script>

<script>
	import { onMount } from 'svelte'
	import { slide } from 'svelte/transition'
	import { quartOut } from 'svelte/easing'
	import { todos, loadTodos } from '$lib/stores/todos.js'
	import { lists, loadLists } from '$lib/stores/lists.js'
	import DateModal from '$lib/DateModal.svelte'
	import { epochToText } from '$lib/date.js'

	let text = ''
	let modal
	let currentTodo

	onMount(() => {
		let now = new Date(),
			delay = 60000 - (now % 60000)
		setTimeout(
			setInterval(() => {
				$todos = $todos
			}, 60000),
			delay
		)
	})

	async function addTodo() {
		if (text == '') {
			return
		}
		const todo = {
			name: text,
			completed: false,
			listId: '',
			dueDate: null
		}
		text = ''
		console.log(todo)
		const res = await fetch(`/todos.json`, {
			method: 'POST',
			body: JSON.stringify(todo)
		})
		const json = await res.json()
		$todos.push(json.todo)
		$todos = $todos
	}

	async function completeTodo(todo) {
		todo.completed = !todo.completed
		$todos = $todos
		await fetch(`/todos.json`, {
			method: 'PUT',
			body: JSON.stringify(todo)
		})
	}

	async function editName(todo, e) {
		if (e.target.value == '') {
			e.target.value = todo.name
			return
		}
		todo.name = e.target.value
		await fetch(`/todos.json`, {
			method: 'PUT',
			body: JSON.stringify(todo)
		})
	}

	async function deleteTodo(todo) {
		$todos = $todos.filter((t) => t !== todo)
		await fetch(`/todos.json`, {
			method: 'DELETE',
			body: JSON.stringify(todo)
		})
	}

	async function startEditDate(todo) {
		currentTodo = todo
		modal.show(todo.dueDate)
	}

	async function finishEditDate(date) {
		if (!date && currentTodo.dueDate !== null) {
			currentTodo.dueDate = null
			$todos = $todos
			await fetch(`/todos.json`, {
				method: 'PUT',
				body: JSON.stringify(currentTodo)
			})
		}
		if (date && date.getTime() != currentTodo.dueDate) {
			currentTodo.dueDate = date.getTime()
			$todos = $todos
			await fetch(`/todos.json`, {
				method: 'PUT',
				body: JSON.stringify(currentTodo)
			})
		}
		currentTodo = null
	}

	async function sync() {
		loadTodos()
		loadLists()
	}

	function blurOnEnter(event) {
		if (event.keyCode === 13) {
			event.target.blur()
		}
	}
</script>

<svelte:head>
	<title>Todos</title>
</svelte:head>

<div class="content">
	<div class="scroll-container">
		<div class="heading-container">
			<h1>Todos</h1>
			<button class="icon-button-lg sync" on:click={() => sync()}>
				<i class="bi bi-arrow-repeat" />
			</button>
		</div>
		<div class="item-container">
			{#if $todos}
				{#each $todos.filter((todo) => !todo.completed) as todo (todo._id)}
					<div class="todo" transition:slide|local={{ duration: 400, easing: quartOut }}>
						<button
							class={'icon-button ' +
								(todo.completed ? 'checkbox checked' : 'checkbox')}
							on:click={() => completeTodo(todo)}
						>
							<i class="bi bi-check-lg" />
						</button>
						<div class="text-container">
							<input
								class="name"
								type="text"
								value={todo.name}
								on:change={(e) => editName(todo, e)}
								on:keydown={(e) => blurOnEnter(e)}
							/>
							{#if todo.listId && $lists.find((list) => todo.listId === list._id)}
								<a class="list-name" sveltekit:prefetch href="/lists/{todo.listId}">
									{$lists.find((list) => todo.listId === list._id).name}
								</a>
							{/if}
						</div>
						{#if todo.dueDate}
							<button
								class={'due-date' +
									(new Date(todo.dueDate) - new Date() <= 0 ? ' overdue' : '')}
								on:click={() => startEditDate(todo)}
							>
								{epochToText(todo.dueDate)}
							</button>
						{:else}
							<button
								class="icon-button new-date"
								on:click={() => startEditDate(todo)}
							>
								<i class="bi bi-calendar2-plus" />
							</button>
						{/if}
						<button class="icon-button delete" on:click={() => deleteTodo(todo)}>
							<i class="bi bi-x-lg" />
						</button>
					</div>
				{/each}
				{#if $todos.find((todo) => todo.completed)}
					<h2 transition:slide|local={{ duration: 400, easing: quartOut }}>Completed</h2>
				{/if}
				{#each $todos.filter((todo) => todo.completed) as todo (todo._id)}
					<div
						class="todo completed"
						transition:slide|local={{ duration: 400, easing: quartOut }}
					>
						<button
							class={'icon-button ' +
								(todo.completed ? 'checkbox checked' : 'checkbox')}
							on:click={() => completeTodo(todo)}
						>
							<i class="bi bi-check-lg" />
						</button>
						<div class="text-container">
							<input
								class="name"
								type="text"
								value={todo.name}
								on:change={(e) => editName(todo, e)}
								on:keydown={(e) => blurOnEnter(e)}
							/>
							{#if todo.listId && $lists.find((list) => todo.listId === list._id)}
								<a class="list-name" sveltekit:prefetch href="/lists/{todo.listId}"
									>{$lists.find((list) => todo.listId === list._id).name}
								</a>
							{/if}
						</div>
						{#if todo.dueDate}
							<button class="due-date" on:click={() => startEditDate(todo)}>
								{epochToText(todo.dueDate)}
							</button>
						{:else}
							<button
								class="icon-button new-date"
								on:click={() => startEditDate(todo)}
							>
								<i class="bi bi-calendar2-plus" />
							</button>
						{/if}
						<button class="icon-button delete" on:click={() => deleteTodo(todo)}>
							<i class="bi bi-x-lg" />
						</button>
					</div>
				{/each}
			{/if}
		</div>
		<div class="new-container">
			<form class="new" on:submit|preventDefault={addTodo}>
				<button class={'icon-button add' + (text ? ' active' : '')} type="submit">
					<i class="bi bi-plus-lg" />
				</button>
				<input class="name" type="text" placeholder="Add a todo" bind:value={text} />
			</form>
		</div>
	</div>
</div>
<DateModal bind:this={modal} edit={(date) => finishEditDate(date)} />

<style>
	.content {
		position: relative;
		height: 100%;
		padding: 20px 0;
	}

	.list-name {
		font-size: 0.8em;
		line-height: 1em;
		color: var(--sub-color);
		text-decoration: none;
		width: fit-content;
	}
	.list-name:hover {
		color: var(--font-color);
	}
</style>
