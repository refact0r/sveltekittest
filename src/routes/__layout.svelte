<script context="module">
	export async function load({ page }) {
		return {
			props: {
				key: page.path
			}
		}
	}
</script>

<script>
	import '../app.css'
	import { onMount } from 'svelte'
	import { session } from '$app/stores'
	import { fly } from 'svelte/transition'
	import { todos, loadTodos } from '$lib/stores/todos.js'
	import { lists, loadLists } from '$lib/stores/lists.js'
	import Nav from '$lib/nav/Nav.svelte'

	export let key

	$: if ($session.user) {
		console.log('test')
		$todos = $session.todos
		$lists = $session.lists
	}
</script>

<svelte:head>
	<meta name="color-scheme" content={$session.user ? $session.user.theme : 'dark'} />
	<link rel="stylesheet" href={`/themes/${$session.user ? $session.user.theme : 'dark'}.css`} />
</svelte:head>

{#if $session.user}
	<Nav />
	<main>
		{#key key}
			<div
				class="content-container"
				in:fly={{ y: -5, duration: 200, delay: 200 }}
				out:fly|local={{ y: 5, duration: 200 }}
			>
				<slot />
			</div>
		{/key}
	</main>
{:else}
	<div class="background">
		{#key key}
			<div
				class="content-container"
				in:fly={{ x: -5, duration: 100, delay: 100 }}
				out:fly|local={{ x: 5, duration: 100 }}
			>
				<slot />
			</div>
		{/key}
	</div>
{/if}

<style>
	main {
		width: 100%;
		background: var(--bg-color-1);
		height: calc(100vh - 40px);
		border-radius: 20px;
		margin: 20px 20px 20px 0;
	}

	.content-container {
		height: 100%;
		width: 100%;
		position: relative;
	}

	.background {
		background: var(--bg-color-1);
		height: 100%;
		width: 100%;
	}
</style>
