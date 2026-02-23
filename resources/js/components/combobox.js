function blank(value) {
    return (
        value === null ||
        value === undefined ||
        value === '' ||
        (typeof value === 'string' && value.trim() === '')
    )
}

function filled(value) {
    return !blank(value)
}

class Combobox {
    constructor({
        element,
        options,
        placeholder,
        state,
        canOptionLabelsWrap = true,
        canSelectPlaceholder = true,
        initialOptionLabel = null,
        initialOptionLabels = null,
        initialState = null,
        isHtmlAllowed = false,
        isAutofocused = false,
        isDisabled = false,
        isMultiple = false,
        isSearchable = false,
        getOptionLabelUsing = null,
        getOptionLabelsUsing = null,
        getOptionsUsing = null,
        getSearchResultsUsing = null,
        hasDynamicOptions = false,
        hasDynamicSearchResults = true,
        searchPrompt = 'Search...',
        searchDebounce = 1000,
        loadingMessage = 'Loading...',
        searchingMessage = 'Searching...',
        noSearchResultsMessage = 'No results found',
        maxItems = null,
        maxItemsMessage = 'Maximum number of items selected',
        optionsLimit = null,
        searchableOptionFields = ['label'],
        searchQuery = null,
        autoSearch = false,
        livewireId = null,
        statePath = null,
        onStateChange = () => {},
    }) {
        this.element = element
        this.options = options
        this.originalOptions = JSON.parse(JSON.stringify(options))
        this.placeholder = placeholder
        this.state = state
        this.canOptionLabelsWrap = canOptionLabelsWrap
        this.canSelectPlaceholder = canSelectPlaceholder
        this.initialOptionLabel = initialOptionLabel
        this.initialOptionLabels = initialOptionLabels
        this.initialState = initialState
        this.isHtmlAllowed = isHtmlAllowed
        this.isAutofocused = isAutofocused
        this.isDisabled = isDisabled
        this.isMultiple = isMultiple
        this.isSearchable = isSearchable
        this.getOptionLabelUsing = getOptionLabelUsing
        this.getOptionLabelsUsing = getOptionLabelsUsing
        this.getOptionsUsing = getOptionsUsing
        this.getSearchResultsUsing = getSearchResultsUsing
        this.hasDynamicOptions = hasDynamicOptions
        this.hasDynamicSearchResults = hasDynamicSearchResults
        this.searchPrompt = searchPrompt
        this.searchDebounce = searchDebounce
        this.loadingMessage = loadingMessage
        this.searchingMessage = searchingMessage
        this.noSearchResultsMessage = noSearchResultsMessage
        this.maxItems = maxItems
        this.maxItemsMessage = maxItemsMessage
        this.optionsLimit = optionsLimit
        this.searchableOptionFields = Array.isArray(searchableOptionFields)
            ? searchableOptionFields
            : ['label']
        this.initialSearchQuery = searchQuery
        this.autoSearch = autoSearch
        this.livewireId = livewireId
        this.statePath = statePath
        this.onStateChange = onStateChange

        this.labelRepository = {}
        this.selectedIndex = -1
        this.searchQuery = searchQuery || ''
        this.searchTimeout = null
        this.isSearching = false
        this.selectedDisplayVersion = 0

        this.render()
        this.setUpEventListeners()

        if (this.isAutofocused && this.searchInput) {
            this.searchInput.focus()
        }

        if (this.autoSearch && filled(this.initialSearchQuery)) {
            this.performInitialSearch()
        }
    }

    populateLabelRepositoryFromOptions(options) {
        if (!options || !Array.isArray(options)) {
            return
        }

        for (const option of options) {
            if (option.options && Array.isArray(option.options)) {
                this.populateLabelRepositoryFromOptions(option.options)
            } else if (
                option.value !== undefined &&
                option.label !== undefined
            ) {
                this.labelRepository[option.value] = option.label
            }
        }
    }

    render() {
        this.populateLabelRepositoryFromOptions(this.options)

        this.container = document.createElement('div')
        this.container.className = 'prvious-combobox-input-ctn'

        if (!this.canOptionLabelsWrap) {
            this.container.classList.add(
                'prvious-combobox-input-ctn-option-labels-not-wrapped',
            )
        }

        // Selected display for badges (multiple selection only) - shown above input
        if (this.isMultiple) {
            this.selectedDisplay = document.createElement('div')
            this.selectedDisplay.className = 'prvious-combobox-input-value-ctn'
            this.container.appendChild(this.selectedDisplay)
        }

        // Create unified search input with icon
        this.searchContainer = document.createElement('div')
        this.searchContainer.className = 'prvious-combobox-input-search-ctn'

        // Add icon - search icon when searchable, dropdown arrow otherwise
        const searchIcon = document.createElement('span')
        searchIcon.className = 'prvious-combobox-search-icon'
        if (this.isSearchable) {
            searchIcon.innerHTML = '<svg class="fi-icon fi-size-md" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>'
        } else {
            searchIcon.innerHTML = '<svg class="fi-icon fi-size-md" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>'
        }
        this.searchContainer.appendChild(searchIcon)

        this.searchInput = document.createElement('input')
        this.searchInput.className = 'fi-input prvious-combobox-unified-input'
        this.searchInput.type = 'text'
        this.searchInput.setAttribute('aria-label', this.isSearchable ? 'Search' : 'Selection')
        
        if (this.searchQuery) {
            this.searchInput.value = this.searchQuery
        }

        this.searchContainer.appendChild(this.searchInput)
        this.container.appendChild(this.searchContainer)

        this.updateSelectedDisplay()

        this.optionsContainer = document.createElement('div')
        this.optionsContainer.className =
            'prvious-combobox-options-wrapper max-h-60 overflow-y-auto'
        this.optionsContainer.setAttribute('role', 'listbox')
        this.optionsContainer.setAttribute('tabindex', '-1')

        if (this.isMultiple) {
            this.optionsContainer.setAttribute('aria-multiselectable', 'true')
        }

        this.optionsList = document.createElement('ul')
        this.renderOptions()

        this.optionsContainer.appendChild(this.optionsList)

        this.container.appendChild(this.optionsContainer)

        this.element.appendChild(this.container)

        this.applyDisabledState()

        if (this.hasDynamicOptions && this.getOptionsUsing) {
            this.loadDynamicOptions()
        }
    }

    async loadDynamicOptions() {
        this.showLoadingState(false)

        try {
            const fetchedOptions = await this.getOptionsUsing()

            const normalizedFetched = Array.isArray(fetchedOptions)
                ? fetchedOptions
                : fetchedOptions && Array.isArray(fetchedOptions.options)
                  ? fetchedOptions.options
                  : []

            this.options = normalizedFetched
            this.originalOptions = JSON.parse(JSON.stringify(normalizedFetched))

            this.populateLabelRepositoryFromOptions(normalizedFetched)

            this.renderOptions()
        } catch (error) {
            console.error('Error fetching options:', error)
            this.hideLoadingState()
        }
    }

    async performInitialSearch() {
        if (!this.isSearchable || !this.searchInput) {
            return
        }

        const query = this.initialSearchQuery

        if (!filled(query)) {
            return
        }

        this.searchQuery = query
        this.searchInput.value = query

        if (
            !this.getSearchResultsUsing ||
            typeof this.getSearchResultsUsing !== 'function' ||
            !this.hasDynamicSearchResults
        ) {
            this.filterOptions(query.trim().toLowerCase())
            return
        }

        this.isSearching = true

        try {
            this.showLoadingState(true)

            const results = await this.getSearchResultsUsing(query)

            const normalizedResults = Array.isArray(results)
                ? results
                : results && Array.isArray(results.options)
                  ? results.options
                  : []

            this.options = normalizedResults

            this.populateLabelRepositoryFromOptions(normalizedResults)

            this.hideLoadingState()
            this.renderOptions()

            if (this.options.length === 0) {
                this.showNoResultsMessage()
            }
        } catch (error) {
            console.error('Error fetching initial search results:', error)

            this.hideLoadingState()
            this.options = JSON.parse(JSON.stringify(this.originalOptions))
            this.renderOptions()
        } finally {
            this.isSearching = false
        }
    }

    renderOptions() {
        this.optionsList.innerHTML = ''

        let totalRenderedCount = 0
        let optionsToRender = this.options
        let optionsCount = 0
        let hasGroupedOptions = false

        this.options.forEach((option) => {
            if (option.options && Array.isArray(option.options)) {
                optionsCount += option.options.length
                hasGroupedOptions = true
            } else {
                optionsCount++
            }
        })

        if (hasGroupedOptions) {
            this.optionsList.className = 'prvious-combobox-input-options-ctn'
        } else if (optionsCount > 0) {
            this.optionsList.className = 'fi-dropdown-list'
        }

        let ungroupedList = hasGroupedOptions ? null : this.optionsList

        let renderedCount = 0

        for (const option of optionsToRender) {
            if (this.optionsLimit && renderedCount >= this.optionsLimit) {
                break
            }

            if (option.options && Array.isArray(option.options)) {
                let groupOptions = option.options

                if (
                    this.isMultiple &&
                    Array.isArray(this.state) &&
                    this.state.length > 0
                ) {
                    groupOptions = option.options.filter(
                        (groupOption) =>
                            !this.state.includes(groupOption.value),
                    )
                }

                if (groupOptions.length > 0) {
                    if (this.optionsLimit) {
                        const remainingSlots = this.optionsLimit - renderedCount
                        if (remainingSlots < groupOptions.length) {
                            groupOptions = groupOptions.slice(0, remainingSlots)
                        }
                    }

                    this.renderOptionGroup(option.label, groupOptions)
                    renderedCount += groupOptions.length
                    totalRenderedCount += groupOptions.length
                }
            } else {
                if (
                    this.isMultiple &&
                    Array.isArray(this.state) &&
                    this.state.includes(option.value)
                ) {
                    continue
                }

                if (!ungroupedList && hasGroupedOptions) {
                    ungroupedList = document.createElement('ul')
                    ungroupedList.className = 'fi-dropdown-list'
                    this.optionsList.appendChild(ungroupedList)
                }

                const optionElement = this.createOptionElement(
                    option.value,
                    option,
                )
                ungroupedList.appendChild(optionElement)
                renderedCount++
                totalRenderedCount++
            }
        }

        if (totalRenderedCount === 0) {
            if (this.searchQuery) {
                this.showNoResultsMessage()
            }

            if (this.optionsList.parentNode === this.optionsContainer) {
                this.optionsContainer.removeChild(this.optionsList)
            }
        } else {
            this.hideLoadingState()

            if (this.optionsList.parentNode !== this.optionsContainer) {
                this.optionsContainer.appendChild(this.optionsList)
            }
        }
    }

    renderOptionGroup(label, options) {
        if (options.length === 0) {
            return
        }

        const optionGroup = document.createElement('li')
        optionGroup.className = 'prvious-combobox-input-option-group'

        const optionGroupLabel = document.createElement('div')
        optionGroupLabel.className = 'fi-dropdown-header'
        optionGroupLabel.textContent = label

        const groupOptionsList = document.createElement('ul')
        groupOptionsList.className = 'fi-dropdown-list'

        options.forEach((option) => {
            const optionElement = this.createOptionElement(option.value, option)
            groupOptionsList.appendChild(optionElement)
        })

        optionGroup.appendChild(optionGroupLabel)
        optionGroup.appendChild(groupOptionsList)
        this.optionsList.appendChild(optionGroup)
    }

    createOptionElement(value, label) {
        let optionValue = value
        let optionLabel = label
        let isDisabled = false

        if (
            typeof label === 'object' &&
            label !== null &&
            'label' in label &&
            'value' in label
        ) {
            optionValue = label.value
            optionLabel = label.label
            isDisabled = label.isDisabled || false
        }

        const option = document.createElement('li')
        option.className = 'fi-dropdown-list-item prvious-combobox-input-option'

        if (isDisabled) {
            option.classList.add('fi-disabled')
        }

        const optionId = `prvious-combobox-input-option-${Math.random().toString(36).substring(2, 11)}`
        option.id = optionId

        option.setAttribute('role', 'option')
        option.setAttribute('data-value', optionValue)
        option.setAttribute('tabindex', '0')

        if (isDisabled) {
            option.setAttribute('aria-disabled', 'true')
        }

        if (this.isHtmlAllowed && typeof optionLabel === 'string') {
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = optionLabel
            const plainText =
                tempDiv.textContent || tempDiv.innerText || optionLabel
            option.setAttribute('aria-label', plainText)
        }

        const isSelected = this.isMultiple
            ? Array.isArray(this.state) && this.state.includes(optionValue)
            : this.state === optionValue

        option.setAttribute('aria-selected', isSelected ? 'true' : 'false')

        if (isSelected) {
            option.classList.add('fi-selected')
        }

        const labelSpan = document.createElement('span')

        if (this.isHtmlAllowed) {
            labelSpan.innerHTML = optionLabel
        } else {
            labelSpan.textContent = optionLabel
        }

        option.appendChild(labelSpan)

        if (!isDisabled) {
            option.addEventListener('click', (event) => {
                event.preventDefault()
                event.stopPropagation()
                this.selectOption(optionValue)

                if (this.isMultiple) {
                    if (this.isSearchable && this.searchInput) {
                        setTimeout(() => {
                            this.searchInput.focus()
                        }, 0)
                    } else {
                        setTimeout(() => {
                            option.focus()
                        }, 0)
                    }
                }
            })
        }

        return option
    }

    async updateSelectedDisplay() {
        this.selectedDisplayVersion = this.selectedDisplayVersion + 1
        const renderVersion = this.selectedDisplayVersion

        if (!this.searchInput) {
            return
        }

        if (this.isMultiple) {
            // For multiple selection, show badges above the input
            const fragment = document.createDocumentFragment()
            
            if (!Array.isArray(this.state) || this.state.length === 0) {
                this.searchInput.placeholder = this.placeholder
                if (this.selectedDisplay) {
                    this.selectedDisplay.replaceChildren(fragment)
                }
            } else {
                let selectedLabels = await this.getLabelsForMultipleSelection()
                if (renderVersion !== this.selectedDisplayVersion) return
                this.addBadgesForSelectedOptions(selectedLabels, fragment)
                this.searchInput.placeholder = this.searchPrompt
                
                if (renderVersion === this.selectedDisplayVersion && this.selectedDisplay) {
                    this.selectedDisplay.replaceChildren(fragment)
                }
            }
            return
        }

        // For single selection, update input placeholder/value
        if (this.state === null || this.state === '') {
            this.searchInput.placeholder = this.placeholder
            // Clear any existing search when nothing is selected so the placeholder is visible
            this.searchQuery = ''
            this.searchInput.value = ''
            return
        }

        const selectedLabel = await this.getLabelForSingleSelection()
        if (renderVersion !== this.selectedDisplayVersion) return

        // Show selected value as placeholder when not searching
        if (!this.searchQuery) {
            if (this.isHtmlAllowed) {
                // Safely extract text content from HTML
                const tempDiv = document.createElement('div')
                tempDiv.innerHTML = selectedLabel
                this.searchInput.placeholder = tempDiv.textContent || tempDiv.innerText || ''
            } else {
                this.searchInput.placeholder = selectedLabel
            }
        }
    }

    async getLabelsForMultipleSelection() {
        let selectedLabels = this.getSelectedOptionLabels()

        const missingValues = []
        if (Array.isArray(this.state)) {
            for (const value of this.state) {
                if (filled(this.labelRepository[value])) {
                    continue
                }

                if (filled(selectedLabels[value])) {
                    this.labelRepository[value] = selectedLabels[value]
                    continue
                }

                missingValues.push(value.toString())
            }
        }

        if (
            missingValues.length > 0 &&
            filled(this.initialOptionLabels) &&
            JSON.stringify(this.state) === JSON.stringify(this.initialState)
        ) {
            if (Array.isArray(this.initialOptionLabels)) {
                for (const initialOption of this.initialOptionLabels) {
                    if (
                        filled(initialOption) &&
                        initialOption.value !== undefined &&
                        initialOption.label !== undefined &&
                        missingValues.includes(initialOption.value)
                    ) {
                        this.labelRepository[initialOption.value] =
                            initialOption.label
                    }
                }
            }
        } else if (missingValues.length > 0 && this.getOptionLabelsUsing) {
            try {
                const fetchedOptionsArray = await this.getOptionLabelsUsing()

                for (const option of fetchedOptionsArray) {
                    if (
                        filled(option) &&
                        option.value !== undefined &&
                        option.label !== undefined
                    ) {
                        this.labelRepository[option.value] = option.label
                    }
                }
            } catch (error) {
                console.error('Error fetching option labels:', error)
            }
        }

        const result = []
        if (Array.isArray(this.state)) {
            for (const value of this.state) {
                if (filled(this.labelRepository[value])) {
                    result.push(this.labelRepository[value])
                } else if (filled(selectedLabels[value])) {
                    result.push(selectedLabels[value])
                } else {
                    result.push(value)
                }
            }
        }

        return result
    }

    createBadgeElement(value, label) {
        const badge = document.createElement('span')
        badge.className =
            'fi-badge fi-size-md fi-color fi-color-primary fi-text-color-600 dark:fi-text-color-200'

        if (filled(value)) {
            badge.setAttribute('data-value', value)
        }

        const labelContainer = document.createElement('span')
        labelContainer.className = 'fi-badge-label-ctn'

        const labelElement = document.createElement('span')
        labelElement.className = 'fi-badge-label'

        if (this.canOptionLabelsWrap) {
            labelElement.classList.add('fi-wrapped')
        }

        if (this.isHtmlAllowed) {
            labelElement.innerHTML = label
        } else {
            labelElement.textContent = label
        }

        labelContainer.appendChild(labelElement)
        badge.appendChild(labelContainer)

        const removeButton = this.createRemoveButton(value, label)
        badge.appendChild(removeButton)

        return badge
    }

    createRemoveButton(value, label) {
        const removeButton = document.createElement('button')
        removeButton.type = 'button'
        removeButton.className = 'fi-badge-delete-btn'
        removeButton.innerHTML =
            '<svg class="fi-icon fi-size-xs" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon"><path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z"></path></svg>'
        removeButton.setAttribute(
            'aria-label',
            'Remove ' +
                (this.isHtmlAllowed ? label.replace(/<[^>]*>/g, '') : label),
        )

        removeButton.addEventListener('click', (event) => {
            event.stopPropagation()
            if (filled(value)) {
                this.selectOption(value)
            }
        })

        removeButton.addEventListener('keydown', (event) => {
            if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault()
                event.stopPropagation()
                if (filled(value)) {
                    this.selectOption(value)
                }
            }
        })

        return removeButton
    }

    addBadgesForSelectedOptions(selectedLabels, target = this.selectedDisplay) {
        const badgesContainer = document.createElement('div')
        badgesContainer.className = 'prvious-combobox-input-value-badges-ctn'

        selectedLabels.forEach((label, index) => {
            const value = Array.isArray(this.state) ? this.state[index] : null
            const badge = this.createBadgeElement(value, label)
            badgesContainer.appendChild(badge)
        })

        target.appendChild(badgesContainer)
    }

    async getLabelForSingleSelection() {
        let selectedLabel = this.labelRepository[this.state]

        if (blank(selectedLabel)) {
            selectedLabel = this.getSelectedOptionLabel(this.state)
        }

        if (
            blank(selectedLabel) &&
            filled(this.initialOptionLabel) &&
            this.state === this.initialState
        ) {
            selectedLabel = this.initialOptionLabel

            if (filled(this.state)) {
                this.labelRepository[this.state] = selectedLabel
            }
        } else if (blank(selectedLabel) && this.getOptionLabelUsing) {
            try {
                selectedLabel = await this.getOptionLabelUsing()

                if (filled(selectedLabel) && filled(this.state)) {
                    this.labelRepository[this.state] = selectedLabel
                }
            } catch (error) {
                console.error('Error fetching option label:', error)
                selectedLabel = this.state
            }
        } else if (blank(selectedLabel)) {
            selectedLabel = this.state
        }

        return selectedLabel
    }

    addSingleSelectionDisplay(selectedLabel, target = this.selectedDisplay) {
        const labelContainer = document.createElement('span')
        labelContainer.className = 'prvious-combobox-input-value-label'

        if (this.isHtmlAllowed) {
            labelContainer.innerHTML = selectedLabel
        } else {
            labelContainer.textContent = selectedLabel
        }

        target.appendChild(labelContainer)

        if (!this.canSelectPlaceholder) {
            return
        }

        const removeButton = document.createElement('button')
        removeButton.type = 'button'
        removeButton.className = 'prvious-combobox-input-value-remove-btn'
        removeButton.innerHTML =
            '<svg class="fi-icon fi-size-sm" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>'
        removeButton.setAttribute('aria-label', 'Clear selection')

        removeButton.addEventListener('click', (event) => {
            event.stopPropagation()
            this.selectOption('')
        })

        removeButton.addEventListener('keydown', (event) => {
            if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault()
                event.stopPropagation()
                this.selectOption('')
            }
        })

        target.appendChild(removeButton)
    }

    getSelectedOptionLabel(value) {
        if (filled(this.labelRepository[value])) {
            return this.labelRepository[value]
        }

        let selectedLabel = ''

        for (const option of this.options) {
            if (option.options && Array.isArray(option.options)) {
                for (const groupOption of option.options) {
                    if (groupOption.value === value) {
                        selectedLabel = groupOption.label
                        this.labelRepository[value] = selectedLabel
                        break
                    }
                }
            } else if (option.value === value) {
                selectedLabel = option.label
                this.labelRepository[value] = selectedLabel
                break
            }
        }

        return selectedLabel
    }

    setUpEventListeners() {
        if (this.isSearchable && this.searchInput) {
            this.searchInput.addEventListener('input', (event) => {
                if (this.isDisabled) {
                    return
                }

                this.handleSearch(event)
            })

            this.searchInput.addEventListener('keydown', (event) => {
                if (this.isDisabled) {
                    return
                }

                if (event.key === 'Tab') {
                    event.preventDefault()

                    const options = this.getVisibleOptions()
                    if (options.length === 0) return

                    if (event.shiftKey) {
                        this.selectedIndex = options.length - 1
                    } else {
                        this.selectedIndex = 0
                    }

                    options.forEach((option) => {
                        option.classList.remove('fi-selected')
                    })

                    options[this.selectedIndex].classList.add('fi-selected')
                    options[this.selectedIndex].focus()
                } else if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    event.stopPropagation()

                    const options = this.getVisibleOptions()
                    if (options.length === 0) return

                    this.selectedIndex = -1
                    this.searchInput.blur()
                    this.focusNextOption()
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    event.stopPropagation()

                    const options = this.getVisibleOptions()
                    if (options.length === 0) return

                    this.selectedIndex = options.length - 1
                    this.searchInput.blur()

                    options[this.selectedIndex].classList.add('fi-selected')
                    options[this.selectedIndex].focus()

                    if (options[this.selectedIndex].id) {
                        this.optionsContainer.setAttribute(
                            'aria-activedescendant',
                            options[this.selectedIndex].id,
                        )
                    }

                    this.scrollOptionIntoView(options[this.selectedIndex])
                } else if (event.key === 'Enter') {
                    event.preventDefault()
                    event.stopPropagation()

                    if (this.isSearching) {
                        return
                    }

                    const options = this.getVisibleOptions()
                    if (options.length === 0) {
                        return
                    }

                    const firstEnabled = options.find((option) => {
                        const ariaDisabled =
                            option.getAttribute('aria-disabled') === 'true'
                        const hasDisabledClass =
                            option.classList.contains('fi-disabled')
                        const isHidden = option.offsetParent === null
                        return !(ariaDisabled || hasDisabledClass || isHidden)
                    })

                    if (!firstEnabled) {
                        return
                    }

                    const value = firstEnabled.getAttribute('data-value')
                    if (value === null) {
                        return
                    }

                    this.selectOption(value)
                }
            })
        }

        this.optionsContainerKeydownListener = (event) => {
            if (this.isDisabled) {
                return
            }

            if (
                this.isSearchable &&
                document.activeElement === this.searchInput &&
                !['Tab', 'Escape'].includes(event.key)
            ) {
                return
            }

            this.handleOptionsKeydown(event)
        }

        this.optionsContainer.addEventListener(
            'keydown',
            this.optionsContainerKeydownListener,
        )

        if (
            !this.isMultiple &&
            this.livewireId &&
            this.statePath &&
            this.getOptionLabelUsing
        ) {
            this.refreshOptionLabelListener = async (event) => {
                if (
                    event.detail.livewireId === this.livewireId &&
                    event.detail.statePath === this.statePath
                ) {
                    if (filled(this.state)) {
                        try {
                            delete this.labelRepository[this.state]

                            const newLabel = await this.getOptionLabelUsing()

                            if (filled(newLabel)) {
                                this.labelRepository[this.state] = newLabel
                            }

                            const labelContainer =
                                this.selectedDisplay.querySelector(
                                    '.prvious-combobox-input-value-label',
                                )
                            if (filled(labelContainer)) {
                                if (this.isHtmlAllowed) {
                                    labelContainer.innerHTML = newLabel
                                } else {
                                    labelContainer.textContent = newLabel
                                }
                            }

                            this.updateOptionLabelInList(this.state, newLabel)
                        } catch (error) {
                            console.error(
                                'Error refreshing option label:',
                                error,
                            )
                        }
                    }
                }
            }

            window.addEventListener(
                'filament-forms::select.refreshSelectedOptionLabel',
                this.refreshOptionLabelListener,
            )
        }
    }

    updateOptionLabelInList(value, newLabel) {
        this.labelRepository[value] = newLabel

        const options = this.getVisibleOptions()
        for (const option of options) {
            if (option.getAttribute('data-value') === String(value)) {
                option.innerHTML = ''

                if (this.isHtmlAllowed) {
                    const labelSpan = document.createElement('span')
                    labelSpan.innerHTML = newLabel
                    option.appendChild(labelSpan)
                } else {
                    option.appendChild(document.createTextNode(newLabel))
                }

                break
            }
        }

        for (const option of this.options) {
            if (option.options && Array.isArray(option.options)) {
                for (const groupOption of option.options) {
                    if (groupOption.value === value) {
                        groupOption.label = newLabel
                        break
                    }
                }
            } else if (option.value === value) {
                option.label = newLabel
                break
            }
        }

        for (const option of this.originalOptions) {
            if (option.options && Array.isArray(option.options)) {
                for (const groupOption of option.options) {
                    if (groupOption.value === value) {
                        groupOption.label = newLabel
                        break
                    }
                }
            } else if (option.value === value) {
                option.label = newLabel
                break
            }
        }
    }

    handleOptionsKeydown(event) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                event.stopPropagation()
                this.focusNextOption()
                break
            case 'ArrowUp':
                event.preventDefault()
                event.stopPropagation()
                this.focusPreviousOption()
                break
            case ' ':
                event.preventDefault()
                if (this.selectedIndex >= 0) {
                    const focusedOption =
                        this.getVisibleOptions()[this.selectedIndex]
                    if (focusedOption) {
                        focusedOption.click()
                    }
                }
                break
            case 'Enter':
                event.preventDefault()
                if (this.selectedIndex >= 0) {
                    const focusedOption =
                        this.getVisibleOptions()[this.selectedIndex]
                    if (focusedOption) {
                        focusedOption.click()
                    }
                }
                break
            case 'Tab':
                break
            default:
                if (
                    this.isSearchable &&
                    !event.ctrlKey &&
                    !event.metaKey &&
                    !event.altKey &&
                    typeof event.key === 'string' &&
                    event.key.length === 1
                ) {
                    event.preventDefault()
                    const char = event.key

                    if (this.searchInput) {
                        this.searchInput.focus()
                        this.searchInput.value =
                            (this.searchInput.value || '') + char
                        this.searchInput.dispatchEvent(
                            new Event('input', { bubbles: true }),
                        )
                    }
                }
                break
        }
    }

    focusNextOption() {
        const options = this.getVisibleOptions()
        if (options.length === 0) return

        if (this.selectedIndex >= 0 && this.selectedIndex < options.length) {
            options[this.selectedIndex].classList.remove('fi-selected')
        }

        if (
            this.selectedIndex === options.length - 1 &&
            this.isSearchable &&
            this.searchInput
        ) {
            this.selectedIndex = -1
            this.searchInput.focus()
            this.optionsContainer.removeAttribute('aria-activedescendant')
            return
        }

        this.selectedIndex = (this.selectedIndex + 1) % options.length
        options[this.selectedIndex].classList.add('fi-selected')
        options[this.selectedIndex].focus()

        if (options[this.selectedIndex].id) {
            this.optionsContainer.setAttribute(
                'aria-activedescendant',
                options[this.selectedIndex].id,
            )
        }

        this.scrollOptionIntoView(options[this.selectedIndex])
    }

    focusPreviousOption() {
        const options = this.getVisibleOptions()
        if (options.length === 0) return

        if (this.selectedIndex >= 0 && this.selectedIndex < options.length) {
            options[this.selectedIndex].classList.remove('fi-selected')
        }

        if (
            (this.selectedIndex === 0 || this.selectedIndex === -1) &&
            this.isSearchable &&
            this.searchInput
        ) {
            this.selectedIndex = -1
            this.searchInput.focus()
            this.optionsContainer.removeAttribute('aria-activedescendant')
            return
        }

        this.selectedIndex =
            (this.selectedIndex - 1 + options.length) % options.length
        options[this.selectedIndex].classList.add('fi-selected')
        options[this.selectedIndex].focus()

        if (options[this.selectedIndex].id) {
            this.optionsContainer.setAttribute(
                'aria-activedescendant',
                options[this.selectedIndex].id,
            )
        }

        this.scrollOptionIntoView(options[this.selectedIndex])
    }

    scrollOptionIntoView(option) {
        if (!option) return

        const containerRect = this.optionsContainer.getBoundingClientRect()
        const optionRect = option.getBoundingClientRect()

        if (optionRect.bottom > containerRect.bottom) {
            this.optionsContainer.scrollTop +=
                optionRect.bottom - containerRect.bottom
        } else if (optionRect.top < containerRect.top) {
            this.optionsContainer.scrollTop -=
                containerRect.top - optionRect.top
        }
    }

    getVisibleOptions() {
        let ungroupedOptions = []

        if (this.optionsList.classList.contains('fi-dropdown-list')) {
            ungroupedOptions = Array.from(
                this.optionsList.querySelectorAll(':scope > li[role="option"]'),
            )
        } else {
            ungroupedOptions = Array.from(
                this.optionsList.querySelectorAll(
                    ':scope > ul.fi-dropdown-list > li[role="option"]',
                ),
            )
        }

        const groupOptions = Array.from(
            this.optionsList.querySelectorAll(
                'li.prvious-combobox-input-option-group > ul > li[role="option"]',
            ),
        )

        return [...ungroupedOptions, ...groupOptions]
    }

    getSelectedOptionLabels() {
        if (!Array.isArray(this.state) || this.state.length === 0) {
            return {}
        }

        const labels = {}

        for (const value of this.state) {
            let found = false
            for (const option of this.options) {
                if (option.options && Array.isArray(option.options)) {
                    for (const groupOption of option.options) {
                        if (groupOption.value === value) {
                            labels[value] = groupOption.label
                            found = true
                            break
                        }
                    }
                    if (found) break
                } else if (option.value === value) {
                    labels[value] = option.label
                    found = true
                    break
                }
            }
        }

        return labels
    }

    handleSearch(event) {
        const query = event.target.value.trim().toLowerCase()
        this.searchQuery = query

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout)
        }

        if (query === '') {
            this.options = JSON.parse(JSON.stringify(this.originalOptions))
            this.renderOptions()
            return
        }

        if (
            !this.getSearchResultsUsing ||
            typeof this.getSearchResultsUsing !== 'function' ||
            !this.hasDynamicSearchResults
        ) {
            this.filterOptions(query)
            return
        }

        this.searchTimeout = setTimeout(async () => {
            this.searchTimeout = null

            this.isSearching = true

            try {
                this.showLoadingState(true)

                const results = await this.getSearchResultsUsing(query)

                const normalizedResults = Array.isArray(results)
                    ? results
                    : results && Array.isArray(results.options)
                      ? results.options
                      : []

                this.options = normalizedResults

                this.populateLabelRepositoryFromOptions(normalizedResults)

                this.hideLoadingState()
                this.renderOptions()

                if (this.options.length === 0) {
                    this.showNoResultsMessage()
                }
            } catch (error) {
                console.error('Error fetching search results:', error)

                this.hideLoadingState()
                this.options = JSON.parse(JSON.stringify(this.originalOptions))
                this.renderOptions()
            } finally {
                this.isSearching = false
            }
        }, this.searchDebounce)
    }

    showLoadingState(isSearching = false) {
        if (this.optionsList.parentNode === this.optionsContainer) {
            this.optionsContainer.removeChild(this.optionsList)
        }

        this.hideLoadingState()

        const loadingItem = document.createElement('div')
        loadingItem.className = 'prvious-combobox-input-message'
        loadingItem.textContent = isSearching
            ? this.searchingMessage
            : this.loadingMessage
        this.optionsContainer.appendChild(loadingItem)
    }

    hideLoadingState() {
        const loadingItem = this.optionsContainer.querySelector(
            '.prvious-combobox-input-message',
        )
        if (loadingItem) {
            loadingItem.remove()
        }
    }

    showNoResultsMessage() {
        if (this.optionsList.parentNode === this.optionsContainer) {
            this.optionsContainer.removeChild(this.optionsList)
        }

        this.hideLoadingState()

        const noResultsItem = document.createElement('div')
        noResultsItem.className = 'prvious-combobox-input-message'
        noResultsItem.textContent = this.noSearchResultsMessage
        this.optionsContainer.appendChild(noResultsItem)
    }

    filterOptions(query) {
        const searchInLabel = this.searchableOptionFields.includes('label')
        const searchInValue = this.searchableOptionFields.includes('value')

        const filteredOptions = []

        for (const option of this.originalOptions) {
            if (option.options && Array.isArray(option.options)) {
                const filteredGroupOptions = option.options.filter(
                    (groupOption) => {
                        return (
                            (searchInLabel &&
                                groupOption.label
                                    .toLowerCase()
                                    .includes(query)) ||
                            (searchInValue &&
                                String(groupOption.value)
                                    .toLowerCase()
                                    .includes(query))
                        )
                    },
                )

                if (filteredGroupOptions.length > 0) {
                    filteredOptions.push({
                        label: option.label,
                        options: filteredGroupOptions,
                    })
                }
            } else if (
                (searchInLabel && option.label.toLowerCase().includes(query)) ||
                (searchInValue &&
                    String(option.value).toLowerCase().includes(query))
            ) {
                filteredOptions.push(option)
            }
        }

        this.options = filteredOptions

        this.renderOptions()

        if (this.options.length === 0) {
            this.showNoResultsMessage()
        }
    }

    selectOption(value) {
        if (this.isDisabled) {
            return
        }

        if (!this.isMultiple) {
            this.state = value
            this.updateSelectedDisplay()
            this.renderOptions()
            this.onStateChange(this.state)
            return
        }

        let newState = Array.isArray(this.state) ? [...this.state] : []

        if (newState.includes(value)) {
            const badgeToRemove = this.selectedDisplay.querySelector(
                `[data-value="${value}"]`,
            )
            if (filled(badgeToRemove)) {
                const badgesContainer = badgeToRemove.parentElement
                if (
                    filled(badgesContainer) &&
                    badgesContainer.children.length === 1
                ) {
                    newState = newState.filter((v) => v !== value)
                    this.state = newState
                    this.updateSelectedDisplay()
                } else {
                    badgeToRemove.remove()

                    newState = newState.filter((v) => v !== value)
                    this.state = newState
                }
            } else {
                newState = newState.filter((v) => v !== value)
                this.state = newState
                this.updateSelectedDisplay()
            }

            this.renderOptions()

            this.maintainFocusInMultipleMode()
            this.onStateChange(this.state)
            return
        }

        if (this.maxItems && newState.length >= this.maxItems) {
            if (this.maxItemsMessage) {
                alert(this.maxItemsMessage)
            }
            return
        }

        newState.push(value)
        this.state = newState

        const existingBadgesContainer = this.selectedDisplay.querySelector(
            '.prvious-combobox-input-value-badges-ctn',
        )

        if (blank(existingBadgesContainer)) {
            this.updateSelectedDisplay()
        } else {
            this.addSingleBadge(value, existingBadgesContainer)
        }

        this.renderOptions()

        this.maintainFocusInMultipleMode()
        this.onStateChange(this.state)
    }

    async addSingleBadge(value, badgesContainer) {
        let label = this.labelRepository[value]

        if (blank(label)) {
            label = this.getSelectedOptionLabel(value)

            if (filled(label)) {
                this.labelRepository[value] = label
            }
        }

        if (blank(label) && this.getOptionLabelsUsing) {
            try {
                const fetchedOptionsArray = await this.getOptionLabelsUsing()

                for (const option of fetchedOptionsArray) {
                    if (
                        filled(option) &&
                        option.value === value &&
                        option.label !== undefined
                    ) {
                        label = option.label
                        this.labelRepository[value] = label
                        break
                    }
                }
            } catch (error) {
                console.error('Error fetching option label:', error)
            }
        }

        if (blank(label)) {
            label = value
        }

        const badge = this.createBadgeElement(value, label)
        badgesContainer.appendChild(badge)
    }

    maintainFocusInMultipleMode() {
        if (this.isSearchable && this.searchInput) {
            this.searchInput.focus()
            return
        }

        const options = this.getVisibleOptions()
        if (options.length === 0) {
            return
        }

        this.selectedIndex = -1
        if (Array.isArray(this.state) && this.state.length > 0) {
            for (let i = 0; i < options.length; i++) {
                if (
                    this.state.includes(options[i].getAttribute('data-value'))
                ) {
                    this.selectedIndex = i
                    break
                }
            }
        }

        if (this.selectedIndex === -1) {
            this.selectedIndex = 0
        }

        options[this.selectedIndex].classList.add('fi-selected')
        options[this.selectedIndex].focus()
    }

    disable() {
        if (this.isDisabled) return

        this.isDisabled = true
        this.applyDisabledState()
    }

    enable() {
        if (!this.isDisabled) return

        this.isDisabled = false
        this.applyDisabledState()
    }

    applyDisabledState() {
        if (this.isDisabled) {
            this.container.classList.add('fi-disabled')

            if (this.isMultiple) {
                const removeButtons = this.container.querySelectorAll(
                    '.fi-badge-delete-btn',
                )
                removeButtons.forEach((button) => {
                    button.setAttribute('disabled', 'disabled')
                    button.classList.add('fi-disabled')
                })
            }

            if (!this.isMultiple && this.canSelectPlaceholder) {
                const removeButton = this.container.querySelector(
                    '.prvious-combobox-input-value-remove-btn',
                )
                if (removeButton) {
                    removeButton.setAttribute('disabled', 'disabled')
                    removeButton.classList.add('fi-disabled')
                }
            }

            if (this.isSearchable && this.searchInput) {
                this.searchInput.setAttribute('disabled', 'disabled')
                this.searchInput.classList.add('fi-disabled')
            }
        } else {
            this.container.classList.remove('fi-disabled')

            if (this.isMultiple) {
                const removeButtons = this.container.querySelectorAll(
                    '.fi-badge-delete-btn',
                )
                removeButtons.forEach((button) => {
                    button.removeAttribute('disabled')
                    button.classList.remove('fi-disabled')
                })
            }

            if (!this.isMultiple && this.canSelectPlaceholder) {
                const removeButton = this.container.querySelector(
                    '.prvious-combobox-input-value-remove-btn',
                )
                if (removeButton) {
                    removeButton.removeAttribute('disabled')
                    removeButton.classList.remove('fi-disabled')
                }
            }

            if (this.isSearchable && this.searchInput) {
                this.searchInput.removeAttribute('disabled')
                this.searchInput.classList.remove('fi-disabled')
            }
        }
    }

    destroy() {
        if (this.searchInput) {
            this.searchInput.removeEventListener('input', this.handleSearch)
        }

        if (this.optionsContainer && this.optionsContainerKeydownListener) {
            this.optionsContainer.removeEventListener(
                'keydown',
                this.optionsContainerKeydownListener,
            )
        }

        if (this.refreshOptionLabelListener) {
            window.removeEventListener(
                'filament-forms::select.refreshSelectedOptionLabel',
                this.refreshOptionLabelListener,
            )
        }

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout)
            this.searchTimeout = null
        }

        if (this.container) {
            this.container.remove()
        }
    }
}

export default function comboboxFormComponent({
    canOptionLabelsWrap,
    canSelectPlaceholder,
    isHtmlAllowed,
    getOptionLabelUsing,
    getOptionLabelsUsing,
    getOptionsUsing,
    getSearchResultsUsing,
    initialOptionLabel,
    initialOptionLabels,
    initialState,
    isAutofocused,
    isDisabled,
    isMultiple,
    isSearchable,
    hasDynamicOptions,
    hasDynamicSearchResults,
    livewireId,
    loadingMessage,
    maxItems,
    maxItemsMessage,
    noSearchResultsMessage,
    options,
    optionsLimit,
    placeholder,
    searchDebounce,
    searchingMessage,
    searchPrompt,
    searchableOptionFields,
    searchQuery,
    autoSearch,
    state,
    statePath,
}) {
    return {
        combobox: null,

        state,

        init() {
            this.combobox = new Combobox({
                element: this.$refs.combobox,
                options,
                placeholder,
                state: this.state,
                canOptionLabelsWrap,
                canSelectPlaceholder,
                initialOptionLabel,
                initialOptionLabels,
                initialState,
                isHtmlAllowed,
                isAutofocused,
                isDisabled,
                isMultiple,
                isSearchable,
                getOptionLabelUsing,
                getOptionLabelsUsing,
                getOptionsUsing,
                getSearchResultsUsing,
                hasDynamicOptions,
                hasDynamicSearchResults,
                searchPrompt,
                searchDebounce,
                loadingMessage,
                searchingMessage,
                noSearchResultsMessage,
                maxItems,
                maxItemsMessage,
                optionsLimit,
                searchableOptionFields,
                searchQuery,
                autoSearch,
                livewireId,
                statePath,
                onStateChange: (newState) => {
                    this.state = newState
                },
            })

            this.$watch('state', (newState) => {
                if (this.combobox && this.combobox.state !== newState) {
                    this.combobox.state = newState
                    this.combobox.updateSelectedDisplay()
                    this.combobox.renderOptions()
                }
            })
        },

        destroy() {
            if (this.combobox) {
                this.combobox.destroy()
                this.combobox = null
            }
        },
    }
}
